import React, { useState, useRef, useEffect } from 'react';

const DropdownMenu = ({ 
  trigger, 
  children, 
  className = '', 
  align = 'left',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Закрытие при клике вне меню
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Закрытие при нажатии Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <div
        ref={triggerRef}
        className={`dropdown-trigger ${disabled ? 'disabled' : ''}`}
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className={`dropdown-menu ${align}`}>
          <div className="dropdown-content">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: (e) => {
                    if (child.props.onClick) {
                      child.props.onClick(e);
                    }
                    closeDropdown();
                  }
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент для элемента меню
export const DropdownItem = ({ 
  children, 
  onClick, 
  disabled = false, 
  icon, 
  shortcut,
  className = '' 
}) => {
  return (
    <div
      className={`dropdown-item ${disabled ? 'disabled' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      {icon && <span className="dropdown-item-icon">{icon}</span>}
      <span className="dropdown-item-text">{children}</span>
      {shortcut && <span className="dropdown-item-shortcut">{shortcut}</span>}
    </div>
  );
};

// Компонент для разделителя
export const DropdownSeparator = () => {
  return <div className="dropdown-separator" role="separator" />;
};

export default DropdownMenu;