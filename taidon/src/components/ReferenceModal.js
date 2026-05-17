import React, { useState } from 'react';

const ReferenceModal = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('basic');

  if (!isOpen) return null;

  const sqlFunctions = {
    basic: {
      title: 'Базовые функции',
      functions: [
        {
          name: 'SELECT',
          syntax: 'SELECT column1, column2 FROM table_name;',
          description: 'Выбирает данные из одной или нескольких таблиц',
          example: 'SELECT name, email FROM users;'
        },
        {
          name: 'INSERT',
          syntax: 'INSERT INTO table_name (column1, column2) VALUES (value1, value2);',
          description: 'Вставляет новые записи в таблицу',
          example: 'INSERT INTO users (name, email) VALUES (\'Иван\', \'ivan@example.com\');'
        },
        {
          name: 'UPDATE',
          syntax: 'UPDATE table_name SET column1 = value1 WHERE condition;',
          description: 'Обновляет существующие записи в таблице',
          example: 'UPDATE users SET email = \'new@example.com\' WHERE id = 1;'
        },
        {
          name: 'DELETE',
          syntax: 'DELETE FROM table_name WHERE condition;',
          description: 'Удаляет записи из таблицы',
          example: 'DELETE FROM users WHERE active = 0;'
        }
      ]
    },
    aggregate: {
      title: 'Агрегатные функции',
      functions: [
        {
          name: 'COUNT()',
          syntax: 'COUNT(column_name)',
          description: 'Подсчитывает количество строк',
          example: 'SELECT COUNT(*) FROM users;'
        },
        {
          name: 'SUM()',
          syntax: 'SUM(column_name)',
          description: 'Вычисляет сумму значений',
          example: 'SELECT SUM(salary) FROM employees;'
        },
        {
          name: 'AVG()',
          syntax: 'AVG(column_name)',
          description: 'Вычисляет среднее значение',
          example: 'SELECT AVG(age) FROM users;'
        },
        {
          name: 'MAX()',
          syntax: 'MAX(column_name)',
          description: 'Находит максимальное значение',
          example: 'SELECT MAX(salary) FROM employees;'
        },
        {
          name: 'MIN()',
          syntax: 'MIN(column_name)',
          description: 'Находит минимальное значение',
          example: 'SELECT MIN(age) FROM users;'
        }
      ]
    },
    string: {
      title: 'Строковые функции',
      functions: [
        {
          name: 'CONCAT()',
          syntax: 'CONCAT(string1, string2, ...)',
          description: 'Объединяет строки',
          example: 'SELECT CONCAT(first_name, \' \', last_name) AS full_name FROM users;'
        },
        {
          name: 'LENGTH()',
          syntax: 'LENGTH(string)',
          description: 'Возвращает длину строки',
          example: 'SELECT LENGTH(name) FROM users;'
        },
        {
          name: 'UPPER()',
          syntax: 'UPPER(string)',
          description: 'Преобразует строку в верхний регистр',
          example: 'SELECT UPPER(name) FROM users;'
        },
        {
          name: 'LOWER()',
          syntax: 'LOWER(string)',
          description: 'Преобразует строку в нижний регистр',
          example: 'SELECT LOWER(email) FROM users;'
        },
        {
          name: 'SUBSTRING()',
          syntax: 'SUBSTRING(string, start, length)',
          description: 'Извлекает подстроку',
          example: 'SELECT SUBSTRING(name, 1, 3) FROM users;'
        }
      ]
    },
    date: {
      title: 'Функции даты и времени',
      functions: [
        {
          name: 'NOW()',
          syntax: 'NOW()',
          description: 'Возвращает текущую дату и время',
          example: 'SELECT NOW();'
        },
        {
          name: 'CURDATE()',
          syntax: 'CURDATE()',
          description: 'Возвращает текущую дату',
          example: 'SELECT CURDATE();'
        },
        {
          name: 'DATE_FORMAT()',
          syntax: 'DATE_FORMAT(date, format)',
          description: 'Форматирует дату',
          example: 'SELECT DATE_FORMAT(created_at, \'%Y-%m-%d\') FROM users;'
        },
        {
          name: 'DATEDIFF()',
          syntax: 'DATEDIFF(date1, date2)',
          description: 'Вычисляет разность между датами в днях',
          example: 'SELECT DATEDIFF(NOW(), created_at) FROM users;'
        },
        {
          name: 'YEAR()',
          syntax: 'YEAR(date)',
          description: 'Извлекает год из даты',
          example: 'SELECT YEAR(created_at) FROM users;'
        }
      ]
    },
    joins: {
      title: 'Объединения (JOIN)',
      functions: [
        {
          name: 'INNER JOIN',
          syntax: 'SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.table1_id;',
          description: 'Возвращает записи, которые имеют совпадающие значения в обеих таблицах',
          example: 'SELECT u.name, p.title FROM users u INNER JOIN posts p ON u.id = p.user_id;'
        },
        {
          name: 'LEFT JOIN',
          syntax: 'SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.table1_id;',
          description: 'Возвращает все записи из левой таблицы и совпадающие из правой',
          example: 'SELECT u.name, p.title FROM users u LEFT JOIN posts p ON u.id = p.user_id;'
        },
        {
          name: 'RIGHT JOIN',
          syntax: 'SELECT * FROM table1 RIGHT JOIN table2 ON table1.id = table2.table1_id;',
          description: 'Возвращает все записи из правой таблицы и совпадающие из левой',
          example: 'SELECT u.name, p.title FROM users u RIGHT JOIN posts p ON u.id = p.user_id;'
        },
        {
          name: 'FULL OUTER JOIN',
          syntax: 'SELECT * FROM table1 FULL OUTER JOIN table2 ON table1.id = table2.table1_id;',
          description: 'Возвращает все записи из обеих таблиц',
          example: 'SELECT u.name, p.title FROM users u FULL OUTER JOIN posts p ON u.id = p.user_id;'
        }
      ]
    }
  };

  const categories = [
    { key: 'basic', label: 'Базовые' },
    { key: 'aggregate', label: 'Агрегатные' },
    { key: 'string', label: 'Строковые' },
    { key: 'date', label: 'Дата/Время' },
    { key: 'joins', label: 'Объединения' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reference-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 Справочник SQL функций</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="reference-content">
          <div className="reference-sidebar">
            <h3>Категории</h3>
            <div className="category-list">
              {categories.map(category => (
                <button
                  key={category.key}
                  className={`category-btn ${activeCategory === category.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="reference-main">
            <h3>{sqlFunctions[activeCategory].title}</h3>
            <div className="functions-list">
              {sqlFunctions[activeCategory].functions.map((func, index) => (
                <div key={index} className="function-item">
                  <h4 className="function-name">{func.name}</h4>
                  <p className="function-description">{func.description}</p>
                  <div className="function-syntax">
                    <strong>Синтаксис:</strong>
                    <code>{func.syntax}</code>
                  </div>
                  <div className="function-example">
                    <strong>Пример:</strong>
                    <code>{func.example}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceModal;