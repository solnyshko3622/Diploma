import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">Taidon SQL</span>
          <p className="footer-copyright">© 2026 TAIDON SQL</p>
        </div>
        <div className="footer-links">
          <a href="#docs">ДОКУМЕНТАЦИЯ</a>
          <a href="#privacy">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</a>
          <a href="#terms">УСЛОВИЯ ИСПОЛЬЗОВАНИЯ</a>
          <a href="#github">GITHUB</a>
          <a href="#status">СТАТУС</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
