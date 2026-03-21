import React from 'react';
import './main_page.css';
import Footer from '../../components/Footer/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const MainPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="main-page">
      {/* Top Navigation */}
      <nav className="main-nav">
        <div className="nav-content">
          <div className="nav-left">
            <span className="logo">Taidon</span>
            <div className="nav-links">
              <a href="#features">Возможности</a>
              <a href="#how-it-works">Как это работает</a>
              <a href="#testimonials">Отзывы</a>
            </div>
          </div>
          <div className="nav-right">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="btn-text">Войти</button>
            <button className="btn-primary">Начать работу</button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="badge">
            <span className="badge-icon">⚡</span>
            <span className="badge-text">Бета версия</span>
          </div>
          <h1 className="hero-title">
            Точные запросы для <span className="gradient-text">современных команд</span>.
          </h1>
          <p className="hero-description">
            Высокоточный SQL-интерфейс для работы с данными. Управляйте вашими базами данных Postgres, MySQL и SQLite с редакторской точностью.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary btn-large">Начать бесплатно</button>
          </div>
          
          {/* Editor Screenshot */}
          <div className="editor-preview">
            <div className="editor-header">
              <div className="traffic-lights">
                <div className="light light-red"></div>
                <div className="light light-yellow"></div>
                <div className="light light-green"></div>
              </div>
              <div className="file-tab">query_analytics_v4.sql</div>
            </div>
            <div className="editor-placeholder">
              <div className="code-line"><span className="keyword">SELECT</span> users.id, profiles.bio, <span className="function">COUNT</span>(orders.id) <span className="keyword">AS</span> total_orders</div>
              <div className="code-line"><span className="keyword">FROM</span> users</div>
              <div className="code-line"><span className="keyword">LEFT JOIN</span> profiles <span className="keyword">ON</span> profiles.user_id = users.id</div>
              <div className="code-line"><span className="keyword">JOIN</span> orders <span className="keyword">ON</span> orders.user_id = users.id</div>
              <div className="code-line"><span className="keyword">WHERE</span> orders.status = <span className="string">'completed'</span></div>
              <div className="code-line"><span className="keyword">AND</span> orders.amount &gt; <span className="number">500</span></div>
              <div className="code-line comment">-- Расчет сегмента высокой ценности</div>
              <div className="code-line"><span className="keyword">GROUP BY</span> users.id, profiles.bio;</div>
            </div>
          </div>
        </section>

        {/* Bento Features Grid */}
        <section className="features-section">
          <div className="bento-grid">
            {/* Big Feature */}
            <div className="feature-card feature-large">
              <div className="feature-content">
                <span className="feature-icon">📑</span>
                <h3 className="feature-title">Многовкладочный редактор</h3>
                <p className="feature-description">
                  Управляйте сложными миграциями в нескольких вкладках. Нативное переключение контекста с сохранением позиции прокрутки и локального состояния.
                </p>
              </div>
              <div className="feature-tags">
                <span className="tag">Postgres</span>
                <span className="tag">MySQL</span>
                <span className="tag">SQLite</span>
              </div>
            </div>

            {/* Performance Feature */}
            <div className="feature-card feature-vertical">
              <div className="performance-metric">
                <span className="metric-value">&lt;3с</span>
                <p className="metric-label">СКОРОСТЬ ЗАГРУЗКИ</p>
              </div>
              <h3 className="feature-title">Большие наборы данных</h3>
              <p className="feature-description">
                Легко прокручивайте более 10 000 строк без единого падения кадров. Виртуализированный рендеринг для профессионалов.
              </p>
            </div>

            {/* Collaborative Feature */}
            <div className="feature-card">
              <span className="feature-icon">👥</span>
              <h3 className="feature-title">Совместная работа</h3>
              <p className="feature-description">
                Делитесь запросами с коллегами в реальном времени. Парное программирование сложных запросов с отображением курсоров.
              </p>
            </div>

            {/* Security Feature */}
            <div className="feature-card feature-wide">
              <div className="feature-content-horizontal">
                <div>
                  <span className="feature-icon">🔒</span>
                  <h3 className="feature-title">Продвинутая безопасность</h3>
                  <p className="feature-description">
                    Полные журналы аудита для каждого выполненного запроса. Ролевой контроль доступа с интеграцией вашего SSO.
                  </p>
                </div>
                <div className="security-badge">
                  <span className="security-icon">🔑</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Code Snippet Section */}
        <section className="code-section">
          <div className="section-header">
            <h2 className="section-title">Изысканный синтаксис</h2>
            <p className="section-description">
              Команда — это главное. Оптимизировано для визуальной ясности и длинных запросов.
            </p>
          </div>
          <div className="code-snippet">
            <div className="code-line"><span className="line-number">1</span><span className="keyword">SELECT</span> users.id, profiles.bio, <span className="function">COUNT</span>(orders.id) <span className="keyword">AS</span> total_orders</div>
            <div className="code-line"><span className="line-number">2</span><span className="keyword">FROM</span> users</div>
            <div className="code-line"><span className="line-number">3</span><span className="keyword">LEFT JOIN</span> profiles <span className="keyword">ON</span> profiles.user_id = users.id</div>
            <div className="code-line"><span className="line-number">4</span><span className="keyword">JOIN</span> orders <span className="keyword">ON</span> orders.user_id = users.id</div>
            <div className="code-line"><span className="line-number">5</span><span className="keyword">WHERE</span> orders.status = <span className="string">'completed'</span></div>
            <div className="code-line"><span className="line-number">6</span><span className="keyword">AND</span> orders.amount &gt; <span className="number">500</span></div>
            <div className="code-line"><span className="line-number">7</span><span className="comment">-- Расчет сегмента высокой ценности</span></div>
            <div className="code-line"><span className="line-number">8</span><span className="keyword">GROUP BY</span> users.id, profiles.bio;</div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Редакторский подход к данным выделяет Taidon среди других. Это единственный SQL-редактор, который действительно помогает мне сосредоточиться на логике, а не на интерфейсе."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar author-avatar-primary">АИ</div>
                <div className="author-info">
                  <p className="author-name">Анна Иванова</p>
                  <p className="author-title">СТАРШИЙ ИНЖЕНЕР ДАННЫХ, ЯНДЕКС</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                "Наконец-то инструмент, который учитывает требования к производительности больших таблиц. Мы увидели немедленный рост продуктивности всей команды."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar author-avatar-secondary">МП</div>
                <div className="author-info">
                  <p className="author-name">Михаил Петров</p>
                  <p className="author-title">ГЛАВНЫЙ АРХИТЕКТОР, СБЕР</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                "Интерфейс — глоток свежего воздуха. Никакого беспорядка, только Taidon. Это премиальное рабочее пространство, созданное для профессионалов."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar author-avatar-tertiary">ЕС</div>
                <div className="author-info">
                  <p className="author-name">Елена Смирнова</p>
                  <p className="author-title">РУКОВОДИТЕЛЬ АНАЛИТИКИ, VK</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-card">
            <h2 className="cta-title">Готовы работать с точностью?</h2>
            <p className="cta-description">
              Присоединяйтесь к элитным командам данных, которые перешли на Taidon SQL.
            </p>
            <button className="btn-primary btn-large">Начать работу сейчас</button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
