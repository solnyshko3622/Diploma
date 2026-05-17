import React, { useState, useEffect, useRef } from 'react';
import { EditorView, keymap, highlightSpecialChars, drawSelection, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { foldGutter, indentOnInput, bracketMatching, foldKeymap, syntaxHighlighting } from '@codemirror/language';
import { sql } from '@codemirror/lang-sql';
import { monacoThemes } from './themes/monacoThemes';
import { sqlAnalyzer, updateEditorErrors, updateEditorErrorsWithBackend, createDebouncedAnalyzer, analyzeCodeWithBackend, checkBackendAvailability, updateEditorWithBackendErrors } from './analyzer/simpleAnalyzer.js';
import { taidonClient } from './api/taidonClient.js';
import { backendClient } from './api/backendClient.js';
import { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import NewFileModal from './components/NewFileModal';
import ReferenceModal from './components/ReferenceModal';
import QueryResults from './components/QueryResults';
import ProjectsPage from './components/ProjectsPage';
import DropdownMenu, { DropdownItem, DropdownSeparator } from './components/DropdownMenu';

const App = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Состояние для навигации
  const [currentView, setCurrentView] = useState('projects'); // 'projects' или 'editor'
  const [currentProject, setCurrentProject] = useState(null);
  
  const [scripts, setScripts] = useState([
    { id: 1, name: 'Запрос 1', content: 'SELECT * FROM users;' },
    { id: 2, name: 'Запрос 2', content: 'SELECT name, email FROM users WHERE active = 1;' }
  ]);
  const [activeScript, setActiveScript] = useState(scripts[0]);
  const [editorTheme, setEditorTheme] = useState('vs');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Monaco');
  const [nextId, setNextId] = useState(3);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  
  // Состояние для бэкенда и результатов
  const [queryResults, setQueryResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [instanceId, setInstanceId] = useState(null);
  const [useBackendValidation, setUseBackendValidation] = useState(true);
  const [isPreparingInstance, setIsPreparingInstance] = useState(false);
  const [instanceStatus, setInstanceStatus] = useState('unknown'); // 'unknown', 'preparing', 'ready', 'error'
  
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const debouncedAnalyzer = useRef(null);

  // Функция подготовки инстанса
  const prepareInstance = async () => {
    setIsPreparingInstance(true);
    setInstanceStatus('preparing');
    
    try {
      console.log('Preparing PostgreSQL instance...');
      const readyInstanceId = await taidonClient.ensureInstanceReady();
      
      setInstanceId(readyInstanceId);
      setInstanceStatus('ready');
      console.log('Instance ready:', readyInstanceId);
      
      return readyInstanceId;
    } catch (error) {
      console.error('Failed to prepare instance:', error);
      setInstanceStatus('error');
      throw error;
    } finally {
      setIsPreparingInstance(false);
    }
  };

  // Загрузка настроек шрифта из localStorage
  useEffect(() => {
    const savedFont = localStorage.getItem('editorFont');
    if (savedFont) {
      setSelectedFont(savedFont);
    }
  }, []);

  // Загрузка настроек темы редактора из localStorage
  useEffect(() => {
    const savedEditorTheme = localStorage.getItem('editorTheme');
    if (savedEditorTheme && monacoThemes[savedEditorTheme]) {
      setEditorTheme(savedEditorTheme);
    }
  }, []);

  // Сохранение настроек шрифта в localStorage и применение к CSS
  useEffect(() => {
    localStorage.setItem('editorFont', selectedFont);
    // Устанавливаем CSS переменную для шрифта
    document.documentElement.style.setProperty('--editor-font-family', selectedFont);
  }, [selectedFont]);

  // Сохранение настроек темы редактора в localStorage
  useEffect(() => {
    localStorage.setItem('editorTheme', editorTheme);
  }, [editorTheme]);

  // Проверка доступности бэкенда при загрузке
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const available = await checkBackendAvailability();
        setBackendAvailable(available);
        
        if (available) {
          // Ищем активный инстанс
          try {
            const activeInstanceId = await taidonClient.getActiveInstance();
            if (activeInstanceId) {
              setInstanceId(activeInstanceId);
              setInstanceStatus('ready');
              console.log('Found active instance:', activeInstanceId);
            } else {
              setInstanceStatus('unknown');
              console.log('No active instances found');
            }
          } catch (error) {
            console.error('Error checking for active instances:', error);
            setInstanceStatus('unknown');
          }
        }
      } catch (error) {
        console.warn('Ошибка проверки бэкенда:', error);
        setBackendAvailable(false);
        setInstanceStatus('error');
      }
    };
    
    checkBackend();
  }, []);

  // Инициализация debounced анализатора
  useEffect(() => {
    debouncedAnalyzer.current = createDebouncedAnalyzer(async (code) => {
      if (viewRef.current) {
        try {
          let results;
          
          if (useBackendValidation && backendAvailable && instanceId) {
            // Используем бэкенд валидацию
            results = await analyzeCodeWithBackend(code, instanceId);
            updateEditorErrorsWithBackend(viewRef.current, results);
          } else {
            // Используем только локальную валидацию
            results = updateEditorErrors(viewRef.current, code);
          }
          
          setAnalysisResults(results);
        } catch (error) {
          console.error('Ошибка анализа:', error);
          // Fallback к локальной валидации
          const results = updateEditorErrors(viewRef.current, code);
          setAnalysisResults(results);
        }
      }
    }, 3000); // Валидация раз в 3 секунды
  }, [useBackendValidation, backendAvailable, instanceId]);

  useEffect(() => {
    if (editorRef.current) {
      // Создаем базовые расширения
      const basicExtensions = [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
        ]),
        sql(),
        syntaxHighlighting(monacoThemes[editorTheme].highlightStyle),
        sqlAnalyzer(), // Добавляем анализатор SQL
        EditorView.updateListener.of((update) => {
          console.log('EditorView.updateListener triggered, docChanged:', update.docChanged);
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            console.log('Document changed, new content:', newContent);
            
            // Оптимизируем обновления состояния - объединяем в один батч
            setActiveScript(prev => {
              const updated = { ...prev, content: newContent };
              
              // Обновляем scripts только если контент действительно изменился
              setScripts(prevScripts =>
                prevScripts.map(script =>
                  script.id === activeScript.id && script.content !== newContent
                    ? { ...script, content: newContent }
                    : script
                )
              );
              
              // Автосохранение скрипта в бэкенд (с задержкой)
              if (currentProject && activeScript.id && newContent !== prev.content) {
                clearTimeout(window.autoSaveTimeout);
                window.autoSaveTimeout = setTimeout(async () => {
                  try {
                    await backendClient.updateScript(activeScript.id, {
                      content: newContent
                    });
                    console.log('Script auto-saved');
                  } catch (error) {
                    console.error('Auto-save failed:', error);
                  }
                }, 2000); // Автосохранение через 2 секунды после остановки печати
              }
              
              return updated;
            });
            
            // Запускаем немедленный локальный анализ для быстрого отклика
            console.log('About to run immediate local analysis, viewRef.current exists:', !!viewRef.current);
            if (viewRef.current) {
              console.log('Running immediate local analysis for content:', newContent.substring(0, 50) + '...');
              updateEditorErrors(viewRef.current, newContent);
            } else {
              console.log('viewRef.current is null, cannot run analysis');
            }
            
            // Запускаем анализ с задержкой только для значительных изменений
            if (debouncedAnalyzer.current) {
              console.log('Triggering debounced analysis for content:', newContent.substring(0, 50) + '...');
              debouncedAnalyzer.current(newContent);
            } else {
              console.log('debouncedAnalyzer.current is null');
            }
          }
        })
      ];

      // Добавляем тему редактора
      basicExtensions.push(monacoThemes[editorTheme].theme);

      const state = EditorState.create({
        doc: activeScript.content,
        extensions: basicExtensions
      });

      // Удаляем предыдущий view если он существует
      if (viewRef.current) {
        viewRef.current.destroy();
      }

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current
      });

      // Запускаем первоначальный анализ
      if (debouncedAnalyzer.current && activeScript.content.trim()) {
        debouncedAnalyzer.current(activeScript.content);
      }
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [activeScript.id, editorTheme, selectedFont]);

  const createNewScript = async (fileName) => {
    if (!currentProject) {
      console.error('No current project selected');
      return;
    }

    try {
      const newScript = await backendClient.createScript(currentProject.id, {
        name: fileName || `Запрос ${nextId}`,
        content: '-- Новый SQL запрос\nSELECT '
      });
      
      setScripts(prev => [...prev, newScript]);
      setActiveScript(newScript);
      setNextId(prev => prev + 1);
    } catch (error) {
      console.error('Error creating script:', error);
      // Fallback к локальному созданию
      const newScript = {
        id: nextId,
        name: fileName || `Запрос ${nextId}`,
        content: '-- Новый SQL запрос\nSELECT '
      };
      setScripts(prev => [...prev, newScript]);
      setActiveScript(newScript);
      setNextId(prev => prev + 1);
    }
  };

  const openNewFileModal = () => {
    setIsNewFileModalOpen(true);
  };

  const closeNewFileModal = () => {
    setIsNewFileModalOpen(false);
  };

  const deleteScript = async (scriptId) => {
    if (scripts.length <= 1) return;
    
    try {
      // Удаляем скрипт с бэкенда
      await backendClient.deleteScript(scriptId);
      
      const newScripts = scripts.filter(script => script.id !== scriptId);
      setScripts(newScripts);
      
      if (activeScript.id === scriptId) {
        setActiveScript(newScripts[0]);
      }
    } catch (error) {
      console.error('Error deleting script:', error);
      // Показываем ошибку пользователю, но не удаляем локально
      alert('Не удалось удалить скрипт. Попробуйте еще раз.');
    }
  };

  const executeScript = async () => {
    console.log('executeScript called with content:', activeScript.content);
    console.log('Backend available:', backendAvailable);
    console.log('Instance status:', instanceStatus);
    console.log('Instance ID:', instanceId);
    
    if (!activeScript.content.trim()) {
      console.log('Script content is empty, showing alert');
      alert('Запрос не может быть пустым');
      return;
    }

    // if (!backendAvailable) {
    //   alert('Бэкенд недоступен. Проверьте подключение к Taidon API.');
    //   return;
    // }

    setIsExecuting(true);
    setShowResults(false);

    try {
      // Автоматически подготавливаем инстанс если нужно
      let currentInstanceId = instanceId;
      
      if (!currentInstanceId || instanceStatus !== 'ready') {
        console.log('Instance not ready, preparing...');
        currentInstanceId = await prepareInstance();
      }

      const results = await taidonClient.executeQueryForResults(activeScript.content, currentInstanceId);
      console.log('executeQueryForResults returned:', results);
      setQueryResults(results);
      setShowResults(true);
      
      // Если есть ошибки, передаем их в редактор для подсветки
      if (!results.success && results.errors && results.errors.length > 0 && viewRef.current) {
        console.log('Calling updateEditorWithBackendErrors with errors:', results.errors);
        updateEditorWithBackendErrors(viewRef.current, results.errors);
      } else {
        console.log('No errors to highlight or no viewRef:', {
          success: results.success,
          errorsLength: results.errors?.length,
          hasViewRef: !!viewRef.current
        });
      }
    } catch (error) {
      console.log('CATCH BLOCK ENTERED - Error executing query:', error);
      console.error('Ошибка выполнения запроса:', error);
      
      // Если ошибка связана с отсутствием инстанса, пробуем создать новый
      if (error.message.includes('not found') || error.message.includes('instance')) {
        try {
          console.log('Retrying with new instance...');
          const newInstanceId = await prepareInstance();
          const results = await taidonClient.executeQueryForResults(activeScript.content, newInstanceId);
          setQueryResults(results);
          setShowResults(true);
          
          // Если есть ошибки, передаем их в редактор для подсветки
          if (!results.success && results.errors && results.errors.length > 0 && viewRef.current) {
            updateEditorWithBackendErrors(viewRef.current, results.errors);
          }
          return;
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          error = retryError;
        }
      }
      
      // Извлекаем детальную информацию об ошибке
      let errorInfo = { message: error.message };
      
      // Проверяем, есть ли данные бэкенда в ошибке
      if (error.backendData) {
        console.log('Found backend data in App.js:', error.backendData);
        errorInfo = {
          message: error.backendData.details || error.backendData.message || error.message,
          code: error.backendData.code,
          details: error.backendData.details,
          originalMessage: error.backendData.message
        };
      } else {
        // Пытаемся извлечь PostgreSQL ошибку из сообщения
        const errorMessage = error.message;
        console.log('Processing error message:', errorMessage);
        console.log('Contains ERROR:', errorMessage.includes('ERROR:'));
        console.log('Contains LINE:', errorMessage.includes('LINE'));
        if (errorMessage.includes('ERROR:') && errorMessage.includes('LINE')) {
          console.log('Found PostgreSQL error in message, extracting details...');
          const detailsMatch = errorMessage.match(/Failed to run query:\s*(.+)/s);
          if (detailsMatch) {
            const details = detailsMatch[1];
            errorInfo = {
              message: details,
              details: details,
              originalMessage: errorMessage,
              code: 'execution_error'
            };
          }
        }
      }
      
      console.log('Final error info for App.js:', errorInfo);
      
      const errorResults = {
        success: false,
        data: [],
        columns: [],
        errors: [errorInfo],
        executionTime: 0
      };
      setQueryResults(errorResults);
      setShowResults(true);
      
      // Передаем ошибку в редактор для подсветки
      if (viewRef.current) {
        console.log('Calling updateEditorWithBackendErrors from App.js...');
        updateEditorWithBackendErrors(viewRef.current, errorResults.errors);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const executeAllScripts = async () => {
    if (scripts.length === 0) {
      alert('Нет скриптов для выполнения');
      return;
    }

    // if (!backendAvailable) {
    //   alert('Бэкенд недоступен. Проверьте подключение к Taidon API.');
    //   return;
    // }

    const confirmation = confirm(`Выполнить все ${scripts.length} скрипт(а/ов) по очереди?`);
    if (!confirmation) return;

    setIsExecuting(true);
    const allResults = [];
    
    try {
      // Автоматически подготавливаем инстанс если нужно
      let currentInstanceId = instanceId;
      
      if (!currentInstanceId || instanceStatus !== 'ready') {
        console.log('Instance not ready for batch execution, preparing...');
        currentInstanceId = await prepareInstance();
      }

      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        
        if (!script.content.trim()) {
          allResults.push({
            scriptName: script.name,
            success: false,
            errors: ['Пустой запрос'],
            data: [],
            columns: []
          });
          continue;
        }

        try {
          const result = await taidonClient.executeQueryForResults(script.content, currentInstanceId);
          allResults.push({
            scriptName: script.name,
            ...result
          });
        } catch (error) {
          allResults.push({
            scriptName: script.name,
            success: false,
            errors: [error.message],
            data: [],
            columns: []
          });
        }
      }
    } catch (error) {
      console.error('Ошибка подготовки инстанса для batch выполнения:', error);
      allResults.push({
        scriptName: 'Системная ошибка',
        success: false,
        errors: [`Не удалось подготовить инстанс: ${error.message}`],
        data: [],
        columns: []
      });
    }

    // Показываем сводные результаты
    setQueryResults({
      success: allResults.every(r => r.success),
      data: allResults,
      columns: ['Скрипт', 'Статус', 'Строк', 'Ошибки'],
      errors: allResults.filter(r => !r.success).map(r => `${r.scriptName}: ${r.errors.join(', ')}`),
      executionTime: allResults.reduce((sum, r) => sum + (r.executionTime || 0), 0),
      isMultipleResults: true
    });
    setShowResults(true);
    setIsExecuting(false);
  };

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  const changeEditorTheme = (theme) => {
    setEditorTheme(theme);
  };

  const availableThemes = Object.keys(monacoThemes).map(key => ({
    value: key,
    label: monacoThemes[key].name,
    icon: monacoThemes[key].icon
  }));

  const renameScript = async (scriptId, newName) => {
    try {
      // Обновляем название скрипта в бэкенде
      await backendClient.updateScript(scriptId, { name: newName });
      
      setScripts(prev =>
        prev.map(script =>
          script.id === scriptId ? { ...script, name: newName } : script
        )
      );
      if (activeScript.id === scriptId) {
        setActiveScript(prev => ({ ...prev, name: newName }));
      }
    } catch (error) {
      console.error('Error renaming script:', error);
      // В случае ошибки обновляем локально, но показываем предупреждение
      setScripts(prev =>
        prev.map(script =>
          script.id === scriptId ? { ...script, name: newName } : script
        )
      );
      if (activeScript.id === scriptId) {
        setActiveScript(prev => ({ ...prev, name: newName }));
      }
    }
  };

  // Функции для работы с модальными окнами
  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const openReferenceModal = () => {
    setIsReferenceModalOpen(true);
  };

  const closeReferenceModal = () => {
    setIsReferenceModalOpen(false);
  };

  // Функции навигации
  const openProject = async (project) => {
    setCurrentProject(project);
    setCurrentView('editor');
    
    try {
      // Загружаем скрипты проекта с бэкенда
      const projectScripts = await backendClient.getProjectScripts(project.id);
      
      if (projectScripts && projectScripts.length > 0) {
        setScripts(projectScripts);
        setActiveScript(projectScripts[0]);
        setNextId(Math.max(...projectScripts.map(s => s.id)) + 1);
      } else {
        // Создаём базовый скрипт для проекта без скриптов
        const defaultScript = await backendClient.createScript(project.id, {
          name: 'Запрос 1',
          content: '-- Новый SQL запрос\nSELECT '
        });
        
        setScripts([defaultScript]);
        setActiveScript(defaultScript);
        setNextId(defaultScript.id + 1);
      }
    } catch (error) {
      console.error('Error loading project scripts:', error);
      // Fallback к локальным данным
      const defaultScript = {
        id: 1,
        name: 'Запрос 1',
        content: '-- Новый SQL запрос\nSELECT '
      };
      setScripts([defaultScript]);
      setActiveScript(defaultScript);
      setNextId(2);
    }
  };

  const goToProjects = () => {
    setCurrentView('projects');
    setCurrentProject(null);
    setScripts([]);
    setActiveScript(null);
  };

  const createNewProject = async () => {
    try {
      const newProject = await backendClient.createProject({
        name: 'Новый проект',
        description: 'Описание нового проекта',
        is_public: false
      });
      
      openProject(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      // Fallback к локальному созданию
      const newProject = {
        id: Date.now(),
        name: 'Новый проект',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scriptsCount: 0,
        scripts: []
      };
      openProject(newProject);
    }
  };

  // Если мы на странице проектов, показываем её
  if (currentView === 'projects') {
    return (
      <ProjectsPage
        onOpenProject={openProject}
        onCreateProject={createNewProject}
      />
    );
  }

  // Иначе показываем редактор
  return (
    <div className={`app ${isDarkTheme ? 'dark' : 'light'}`}>
      {/* Верхняя панель в стиле IDE */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button onClick={goToProjects} className="btn btn-theme">
            <span>←</span> К проектам
          </button>
          
          {currentProject && (
            <div className="project-info">
              <span className="project-name">{currentProject.name}</span>
            </div>
          )}
          
          <div className="ide-menubar">
            {/* Меню "Файл" */}
            <DropdownMenu
              trigger={<span className="ide-menu-item">Файл</span>}
              align="left"
            >
              <DropdownItem
                icon="📄"
                onClick={openNewFileModal}
                shortcut="Ctrl+N"
              >
                Новый файл
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                icon="📚"
                onClick={openReferenceModal}
              >
                Справочник SQL
              </DropdownItem>
            </DropdownMenu>

            {/* Меню "Запуск" */}
            <DropdownMenu
              trigger={<span className="ide-menu-item">Запуск</span>}
              align="left"
            >
              <DropdownItem
                icon={isExecuting || isPreparingInstance ? '⏳' : '▶️'}
                onClick={executeScript}
                disabled={isExecuting || !backendAvailable || isPreparingInstance}
                shortcut="F5"
              >
                {isExecuting ? 'Выполняется...' : isPreparingInstance ? 'Подготовка...' : 'Выполнить запрос'}
              </DropdownItem>
              <DropdownItem
                icon={isExecuting || isPreparingInstance ? '⏳' : '⏯️'}
                onClick={executeAllScripts}
                disabled={isExecuting || !backendAvailable || isPreparingInstance}
                shortcut="Ctrl+F5"
              >
                {isExecuting ? 'Выполняется...' : isPreparingInstance ? 'Подготовка...' : 'Выполнить все'}
              </DropdownItem>
              <DropdownSeparator />
              {backendAvailable && instanceStatus !== 'ready' && (
                <DropdownItem
                  icon={isPreparingInstance ? '⏳' : '🔧'}
                  onClick={async () => {
                    try {
                      await prepareInstance();
                      alert('Инстанс успешно подготовлен!');
                    } catch (error) {
                      alert(`Ошибка подготовки инстанса: ${error.message}`);
                    }
                  }}
                  disabled={isPreparingInstance || isExecuting}
                >
                  {isPreparingInstance ? 'Подготовка...' : 'Подготовить инстанс'}
                </DropdownItem>
              )}
              <DropdownItem
                icon="🔄"
                onClick={async () => {
                  try {
                    console.log('Manual backend and instance check...');
                    const available = await checkBackendAvailability();
                    setBackendAvailable(available);
                    
                    if (available) {
                      if (taidonClient.config.instanceId) {
                        const check = await taidonClient.checkInstanceAvailability(taidonClient.config.instanceId);
                        if (check.available) {
                          setInstanceId(taidonClient.config.instanceId);
                          setInstanceStatus('ready');
                          alert('Бэкенд доступен! Инстанс готов к работе.');
                        } else {
                          setInstanceStatus('unknown');
                          alert(`Бэкенд доступен, но инстанс недоступен: ${check.reason}`);
                        }
                      } else {
                        setInstanceStatus('unknown');
                        alert('Бэкенд доступен, но инстанс не настроен.');
                      }
                    } else {
                      setInstanceStatus('error');
                      alert('Бэкенд недоступен');
                    }
                  } catch (error) {
                    console.error('Manual check error:', error);
                    setInstanceStatus('error');
                    alert('Ошибка проверки: ' + error.message);
                  }
                }}
              >
                Проверить подключение
              </DropdownItem>
            </DropdownMenu>

            {/* Меню "Настройки" */}
            <DropdownMenu
              trigger={<span className="ide-menu-item">Настройки</span>}
              align="left"
            >
              <DropdownItem
                icon={isDarkTheme ? '☀️' : '🌙'}
                onClick={toggleTheme}
              >
                {isDarkTheme ? 'Светлая тема' : 'Тёмная тема'}
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon="🔤">
                <div className="font-selector">
                  <label htmlFor="font-select" className="font-label">
                    Шрифт:
                  </label>
                  <select
                    id="font-select"
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="font-select"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="Monaco">Monaco</option>
                    <option value="Menlo">Menlo</option>
                    <option value="Consolas">Consolas</option>
                    <option value="'Courier New'">Courier New</option>
                    <option value="'Ubuntu Mono'">Ubuntu Mono</option>
                    <option value="'JetBrains Mono'">JetBrains Mono</option>
                    <option value="'Fira Code'">Fira Code</option>
                    <option value="'Source Code Pro'">Source Code Pro</option>
                    <option value="'Roboto Mono'">Roboto Mono</option>
                    <option value="'SF Mono'">SF Mono</option>
                  </select>
                </div>
              </DropdownItem>
              <DropdownItem icon="🎨">
                <div className="font-selector">
                  <label htmlFor="editor-theme-select" className="font-label">
                    Тема редактора:
                  </label>
                  <select
                    id="editor-theme-select"
                    value={editorTheme}
                    onChange={(e) => changeEditorTheme(e.target.value)}
                    className="font-select"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {availableThemes.map(theme => (
                      <option key={theme.value} value={theme.value}>
                        {theme.icon} {theme.label}
                      </option>
                    ))}
                  </select>
                </div>
              </DropdownItem>
              {backendAvailable && (
                <>
                  <DropdownSeparator />
                  <DropdownItem>
                    <label className="validation-toggle">
                      <input
                        type="checkbox"
                        checked={useBackendValidation}
                        onChange={(e) => setUseBackendValidation(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="toggle-text">Бэкенд валидация</span>
                    </label>
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>
          </div>
          
          {/* Индикатор статуса инстанса */}
          {backendAvailable && (
            <div className={`instance-status ${instanceStatus}`}>
              <span className="status-icon">
                {instanceStatus === 'ready' && '✅'}
                {instanceStatus === 'preparing' && '⏳'}
                {instanceStatus === 'error' && '❌'}
                {instanceStatus === 'unknown' && '❓'}
              </span>
              <span className="status-text">
                {instanceStatus === 'ready' && 'Инстанс готов'}
                {instanceStatus === 'preparing' && 'Подготовка инстанса...'}
                {instanceStatus === 'error' && 'Ошибка инстанса'}
                {instanceStatus === 'unknown' && 'Инстанс не проверен'}
              </span>
            </div>
          )}
        </div>
        
        <div className="toolbar-right">
          {/* Блок аутентификации */}
          <div className="auth-section">
            {isAuthenticated ? (
              <div className="user-menu">
                <button
                  className="user-avatar-btn"
                  onClick={openProfileModal}
                  title={`Личный кабинет - ${user.full_name || user.username || 'Пользователь'}`}
                >
                  <div className="user-avatar">
                    {(user.full_name || user.username || 'П').charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.full_name || user.username || 'Пользователь'}</span>
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className="btn btn-outline"
                  onClick={() => openAuthModal('login')}
                >
                  Войти
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => openAuthModal('register')}
                >
                  Регистрация
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="main-content">
        {/* Боковая панель со скриптами */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>SQL Скрипты</h3>
          </div>
          <div className="scripts-list">
            {scripts.map(script => (
              <div
                key={script.id}
                className={`script-item ${activeScript.id === script.id ? 'active' : ''}`}
                onClick={() => setActiveScript(script)}
              >
                <div className="script-name">
                  <input
                    type="text"
                    value={script.name}
                    onChange={(e) => renameScript(script.id, e.target.value)}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        renameScript(script.id, `Запрос ${script.id}`);
                      }
                    }}
                    className="script-name-input"
                  />
                </div>
                {scripts.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScript(script.id);
                    }}
                    className="delete-btn"
                    title="Удалить скрипт"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Справочник в нижней части сайдбара */}
          <div className="sidebar-footer">
            <button
              className="reference-btn"
              onClick={openReferenceModal}
              title="Справочник SQL функций"
            >
              <span className="reference-icon">📚</span>
              <span className="reference-text">Справочник</span>
            </button>
          </div>
        </div>

        {/* Редактор */}
        <div className="editor-container">
          <div className="editor-header">
            <h4>{activeScript.name}</h4>
          </div>
          <div className="editor" ref={editorRef}></div>
          
          {/* Панель результатов */}
          <QueryResults
            results={queryResults}
            isVisible={showResults}
            onClose={() => setShowResults(false)}
          />
        </div>
      </div>

      {/* Модальные окна */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
      
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />

      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={closeNewFileModal}
        onCreateFile={createNewScript}
      />

      <ReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={closeReferenceModal}
      />
    </div>
  );
};

export default App;