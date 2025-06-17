import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import '../styles/Header.css';
import { BellIcon, UserPlaceholderIcon } from './icons';

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