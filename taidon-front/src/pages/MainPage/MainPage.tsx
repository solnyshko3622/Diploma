import React from 'react';
import { useNavigate } from 'react-router-dom';
import './main_page.css';
import Footer from '../../components/Footer/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const MainPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
            <button className="btn-text" onClick={() => navigate('/login')}>Войти</button>
            <button className="btn-primary" onClick={() => navigate('/register')}>Начать работу</button>
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
            Упрощаем работу с SQL <span className="gradient-text">улучшаем пользовательский опыт</span>.
          </h1>
          <p className="hero-description">
            Простой и лёгкий SQL-интерфейс для работы с данными. Управляйте вашими базами данных быстро и просто.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary btn-large" onClick={() => navigate('/register')}>Начать бесплатно</button>
          </div>
          
          {/* Editor Screenshot */}
          <div className="editor-preview">

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
              <h3 className="feature-title">Качественная подсветка</h3>
              <p className="feature-description">
                Разбор кода и подсветка синтаксиса для уменьшения ошибок
              </p>
            </div>

            {/* Security Feature */}
            <div className="feature-card feature-wide">
              <div className="feature-content-horizontal">
                <div>
                  <span className="feature-icon">🔒</span>
                  <h3 className="feature-title">Простой интерфейс</h3>
                  <p className="feature-description">
                    Интерфейс, не перегруженный сложным функционалом для простой работы
                  </p>
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
             Оптимизированная подсветка синтаксиса для уменьшения ошибок
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

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-card">
            <h2 className="cta-title">Готовы работать с точностью?</h2>
            <p className="cta-description">
              Присоединяйтесь к командам, которые перешли на Taidon SQL.
            </p>
            <button className="btn-primary btn-large" onClick={() => navigate('/register')}>Начать работу сейчас</button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
