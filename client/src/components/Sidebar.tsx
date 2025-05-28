import React from 'react';
import { User } from '../types';
import '../styles/Sidebar.css';

const ProfileIcon = () => (
  <svg className="sidebar-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
);
const HomeIcon = () => (
  <svg className="sidebar-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
);
const NewsIcon = () => (
  <svg className="sidebar-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
);
const DiscussionsIcon = () => (
  <svg className="sidebar-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
);
const EventsIcon = () => (
  <svg className="sidebar-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
);
const TrophyIcon = () => (
  <svg className="sidebar-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20.5 3A1.5 1.5 0 0019 4.5V5H5V4.5A1.5 1.5 0 003.5 3h-1A1.5 1.5 0 001 4.5V8c0 1.92 1.21 3.54 3 4.23V20.5A1.5 1.5 0 005.5 22h13a1.5 1.5 0 001.5-1.5V12.23c1.79-.69 3-2.31 3-4.23V4.5A1.5 1.5 0 0020.5 3h-1zm-4.5 5H8V6h8v2zM4 8V5h1v3zm15 0V5h1v3z"/></svg>
);
const LogoutIcon = () => (
  <svg className="sidebar-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
);
const StarIcon = () => (
  <svg className="sidebar-points-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
);
const UserPlaceholderIcon = () => (
    <svg className="sidebar-user-avatar-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);
const ChevronLeftIcon = () => (
    <svg className="sidebar-toggle-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
);
const ChevronRightIcon = () => ( 
    <svg className="sidebar-toggle-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
);

interface SidebarProps {
  user: User | null;
  onLogoutClick: () => void;
  activeRoute?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    user, 
    onLogoutClick, 
    activeRoute = "/events",
    isCollapsed,
    onToggleCollapse
}) => {
  const userAvatar = user?.avatarUrl || null;
  const userPoints = user?.points === undefined || user?.points === null ? 0 : user.points;
  const userStatus = user?.is_admin ? 'Администратор' : 'Студент';

  const navLinks = [
    { href: "/profile", icon: <ProfileIcon />, text: "Профиль" },
    { href: "/", icon: <HomeIcon />, text: "Главная" },
    { href: "/news", icon: <NewsIcon />, text: "Новости" },
    { href: "/discussions", icon: <DiscussionsIcon />, text: "Обсуждения" },
    { href: "/events", icon: <EventsIcon />, text: "Мероприятия" },
    { href: "/rewards", icon: <TrophyIcon />, text: "Награды" },
  ];

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle-btn" 
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Развернуть боковую панель" : "Свернуть боковую панель"}
        title={isCollapsed ? "Развернуть" : "Свернуть"}
      >
        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </button>

      <div className="sidebar-user-profile">
        <div className="sidebar-user-avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={user?.username || 'Аватар'} className="sidebar-user-avatar-img" />
          ) : (
            <UserPlaceholderIcon />
          )}
        </div>
        {!isCollapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.username || 'Пользователь'}</div>
            <div className="sidebar-user-points">
              <StarIcon /> 
              <span>{userPoints}</span>
            </div>
            <div className="sidebar-user-status">{userStatus}</div>
          </div>
        )}
      </div>

      <nav className="sidebar-navigation">
        <ul>
          {navLinks.map((link) => (
            <li key={link.href} title={isCollapsed ? link.text : undefined}>
              <a 
                href={link.href} 
                className={`sidebar-nav-link ${activeRoute === link.href ? 'active' : ''}`}
              >
                <span className="sidebar-nav-icon-wrapper">{link.icon}</span>
                {!isCollapsed && <span>{link.text}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="sidebar-logout-section">
          <button onClick={onLogoutClick} className="sidebar-nav-link sidebar-logout-button">
            <span className="sidebar-nav-icon-wrapper"><LogoutIcon /></span>
            <span>Выход</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;