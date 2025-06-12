import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import '../styles/Header.css';

const BellIcon = () => (
  <svg className="header-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
  </svg>
);
const UserPlaceholderIcon = () => (
    <svg className="header-user-avatar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

interface HeaderProps {
  user: User | null;
  onLogoutClick: () => void;
  onNavigate: (mode: 'list' | 'calendar') => void;
  viewMode: 'list' | 'calendar';
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogoutClick,
  onNavigate,
  viewMode,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);

  const userAvatar = user?.avatarUrl || null; 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          avatarButtonRef.current &&
          !avatarButtonRef.current.contains(event.target as Node)
          ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="app-header">
      <div className="app-header-left">
        <a href="/" className="app-header-logo-link">
          <img src="/assets/main/kemsu-logo-2.png" alt="Логотип КемГУ Пульс" className="app-header-logo-img" />
        </a>
      </div>

      <div className="app-header-center">
        <nav className="app-header-nav">
          <button 
            className={`app-header-nav-link ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onNavigate('list')}>
              Мероприятия
          </button>
          <button 
            className={`app-header-nav-link ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => onNavigate('calendar')}>
              Расписание
          </button>
        </nav>
      </div>

      <div className="app-header-right">
        <button className="app-header-action-btn" title="Уведомления" aria-label="Уведомления">
          <BellIcon />
        </button>
        
        <div className="app-header-user-menu" ref={dropdownRef}>
          <button 
            ref={avatarButtonRef}
            className="app-header-user-avatar-button" 
            aria-label="Личный кабинет"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
          >
            {userAvatar ? (
              <img src={userAvatar} alt={user?.username || 'Аватар пользователя'} className="header-user-avatar" />
            ) : (
              <UserPlaceholderIcon />
            )}
          </button>
          <div className={`app-header-dropdown ${isDropdownOpen ? 'open' : ''}`}> 
            {user && <div className="dropdown-user-info">Привет, {user.username}!</div>}
            <a href="/profile" className="dropdown-link" onClick={() => setIsDropdownOpen(false)}>Профиль</a>
            <a href="/settings" className="dropdown-link" onClick={() => setIsDropdownOpen(false)}>Настройки</a>
            <button 
              onClick={() => {
                onLogoutClick();
                setIsDropdownOpen(false);
              }} 
              className="dropdown-link dropdown-logout-btn">
                Выход
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;