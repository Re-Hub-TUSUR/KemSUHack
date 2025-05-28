import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import '../styles/Header.css';

const HeartIcon = () => (
  <svg className="header-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const MessageIcon = () => (
  <svg className="header-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);
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
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
);

interface HeaderProps {
  user: User | null;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogoutClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted');
  };

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
        <nav className="app-header-nav">
          <a href="/news" className="app-header-nav-link">Новости</a>
          <a href="/events" className="app-header-nav-link active">Мероприятия</a>
          <a href="/my-opportunities" className="app-header-nav-link">Мои возможности</a>
          <a href="/rewards-shop" className="app-header-nav-link">Магазин наград</a>
        </nav>
      </div>

      <div className="app-header-center">
        <form onSubmit={handleSearchSubmit} className="app-header-search-form">
          <input 
            type="search" 
            placeholder="Поиск по сайту..." 
            className="app-header-search-input"
          />
          <button type="submit" className="app-header-search-button" aria-label="Найти">
            <SearchIcon />
          </button>
        </form>
      </div>

      <div className="app-header-right">
        <button className="app-header-action-btn" title="Избранное" aria-label="Избранные мероприятия">
          <HeartIcon />
        </button>
        <button className="app-header-action-btn" title="Сообщения" aria-label="Сообщения">
          <MessageIcon />
        </button>
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