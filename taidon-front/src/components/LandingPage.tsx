import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Header } from './Header';

export function LandingPage() {
  const navigate = useNavigate();
  const { auth, theme, setShowAuthForm, setAuthFormType } = useApp();

  const features = [
    {
      icon: '⚡',
      title: 'Быстрый старт',
      description: 'Начните работу с SQL за 5 минут без сложной настройки'
    },
    {
      icon: '🎯',
      title: 'Интуитивный интерфейс',
      description: 'Современный дизайн с подсветкой синтаксиса и автодополнением'
    },
    {
      icon: '🔒',
      title: 'Безопасность',
      description: 'Защищенные подключения и предупреждения об опасных операциях'
    },
    {
      icon: '👥',
      title: 'Коллаборация',
      description: 'Совместная работа над проектами и обмен запросами'
    },
    {
      icon: '📊',
      title: 'Аналитика',
      description: 'Статистика выполнения запросов и визуализация результатов'
    },
    {
      icon: '🌐',
      title: 'Кросс-платформенность',
      description: 'Работайте в любом современном браузере на любом устройстве'
    }
  ];

  const supportedDatabases = [
    { name: 'PostgreSQL', icon: '🐘' },
    { name: 'MySQL', icon: '🐬' },
    { name: 'SQLite', icon: '💾' }
  ];

  return (
    <div className={`app ${theme === 'dark' ? 'dark' : ''}`}>
      <Header showNavigation={false} />
      
      <div className="landing-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Taidon - Современный SQL редактор для всех
            </h1>
            <p className="hero-subtitle">
              Простой и мощный инструмент для работы с базами данных. 
              Идеально подходит для разработчиков, аналитиков и студентов.
            </p>
            <div className="hero-actions">
              {!auth.user ? (
                <>
                  <button
                    className="btn-primary large"
                    onClick={() => {
                      setAuthFormType('register');
                      navigate('/auth');
                    }}
                  >
                    Начать бесплатно
                  </button>
                  <button
                    className="btn-secondary large"
                    onClick={() => {
                      setAuthFormType('login');
                      navigate('/auth');
                    }}
                  >
                    Войти
                  </button>
                </>
              ) : (
                <button
                  className="btn-primary large"
                  onClick={() => navigate('/projects')}
                >
                  Перейти к проектам
                </button>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="code-preview">
              <div className="code-header">
                <div className="code-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="code-title">example.sql</div>
              </div>
              <pre className="code-content">
{`SELECT 
  users.name,
  orders.total,
  orders.created_at
FROM users
JOIN orders ON users.id = orders.user_id
WHERE orders.status = 'completed'
ORDER BY orders.total DESC
LIMIT 10;`}
              </pre>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Возможности Taidon</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Database Support */}
        <section className="databases-section">
          <div className="container">
            <h2 className="section-title">Поддерживаемые базы данных</h2>
            <div className="databases-grid">
              {supportedDatabases.map((db, index) => (
                <div key={index} className="database-card">
                  <div className="database-icon">{db.icon}</div>
                  <h3 className="database-name">{db.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Features */}
        <section className="tech-section">
          <div className="container">
            <h2 className="section-title">Технические возможности</h2>
            <div className="tech-features">
              <div className="tech-column">
                <h3>Основной функционал</h3>
                <ul>
                  <li>Многострочный SQL редактор с подсветкой синтаксиса</li>
                  <li>Автодополнение по таблицам и столбцам</li>
                  <li>Валидация синтаксиса в реальном времени</li>
                  <li>Отображение результатов в табличном формате</li>
                  <li>Сохранение истории запросов</li>
                </ul>
              </div>
              <div className="tech-column">
                <h3>Безопасность и надежность</h3>
                <ul>
                  <li>Предупреждения об опасных операциях</li>
                  <li>Безопасное хранение учетных данных</li>
                  <li>Лимиты на выполнение запросов</li>
                  <li>Режим "только для чтения"</li>
                  <li>Ведение лога операций</li>
                </ul>
              </div>
              <div className="tech-column">
                <h3>Коллаборация</h3>
                <ul>
                  <li>Совместный просмотр запросов</li>
                  <li>Комментирование и обсуждение</li>
                  <li>Экспорт/импорт коллекций</li>
                  <li>Генерация уникальных ссылок</li>
                  <li>Режим реального времени</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2 className="cta-title">Готовы начать работу с SQL?</h2>
            <p className="cta-subtitle">
              Присоединяйтесь к тысячам разработчиков, которые уже используют Taidon 
              для эффективной работы с базами данных
            </p>
            <div className="cta-actions">
              {!auth.user ? (
                <button
                  className="btn-primary xlarge"
                  onClick={() => {
                    setAuthFormType('register');
                    navigate('/auth');
                  }}
                >
                  Зарегистрироваться бесплатно
                </button>
              ) : (
                <button
                  className="btn-primary xlarge"
                  onClick={() => navigate('/projects')}
                >
                  Перейти к проектам
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <h3>Taidon</h3>
                <p>Современный SQL редактор для профессионалов</p>
              </div>
              <div className="footer-links">
                <div className="footer-column">
                  <h4>Продукт</h4>
                  <a href="#features">Возможности</a>
                  <a href="#pricing">Тарифы</a>
                  <a href="#docs">Документация</a>
                </div>
                <div className="footer-column">
                  <h4>Поддержка</h4>
                  <a href="#help">Помощь</a>
                  <a href="#community">Сообщество</a>
                  <a href="#contact">Контакты</a>
                </div>
                <div className="footer-column">
                  <h4>Компания</h4>
                  <a href="#about">О нас</a>
                  <a href="#blog">Блог</a>
                  <a href="#careers">Карьера</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 Taidon. Все права защищены.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}