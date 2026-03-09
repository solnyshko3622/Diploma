import { useState, useRef, useEffect } from 'react';
import type { User } from '../types';

interface UserMenuProps {
  user: User;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onLogout: () => void;
}

export function UserMenu({ user, theme, onThemeToggle, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className="user-menu-toggle"
        onClick={toggleMenu}
        aria-label="User menu"
      >
        <div className="user-avatar">
          {getInitials(user.name)}
        </div>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <div className="user-avatar large">
              {getInitials(user.name)}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>

          <div className="user-menu-divider"></div>

          <div className="user-menu-options">
            <button 
              className="user-menu-option"
              onClick={onThemeToggle}
            >
              <span className="option-icon">
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
              <span className="option-text">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>

            <button 
              className="user-menu-option logout"
              onClick={onLogout}
            >
              <span className="option-icon">🚪</span>
              <span className="option-text">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}