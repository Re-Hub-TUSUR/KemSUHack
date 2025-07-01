import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { User, Notification } from '../types';
import '../styles/Header.css';
import '../styles/NotificationDropdown.css';
import { BellIcon, UserPlaceholderIcon } from './icons';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  user: User | null;
  onLogoutClick: () => void;
  onNavigate: (mode: 'list' | 'calendar') => void;
  viewMode: 'list' | 'calendar' | null;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogoutClick,
  onNavigate,
  viewMode,
}) => {
  const { fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetchWithAuth('/api/notifications');
      if (response.ok) {
        const data: Notification[] = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error("Ошибка при загрузке уведомлений:", error);
    }
  }, [user, fetchWithAuth]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await fetchWithAuth('/api/notifications/mark-as-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Ошибка при пометке уведомлений как прочитанных:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    setIsNotificationOpen(false);

    if (!notification.is_read) {
        try {
            await fetchWithAuth(`/api/notifications/${notification.id}/mark-as-read`, { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Ошибка при пометке уведомления как прочитанного:", error);
        }
    }

    if (notification.event_id) {
      navigate('/', { state: { openEventId: notification.event_id } });
    }
  };

  const userAvatar = user?.avatarUrl || null; 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node) && avatarButtonRef.current && !avatarButtonRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (isNotificationOpen && notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node) && bellButtonRef.current && !bellButtonRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen, isNotificationOpen]);


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
        <div className="app-header-user-menu">
          <button
            ref={bellButtonRef}
            onClick={() => setIsNotificationOpen(prev => !prev)}
            className="app-header-action-btn"
            title="Уведомления"
            aria-label="Уведомления"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="app-header-notification-badge">{unreadCount}</span>
            )}
          </button>
          <div ref={notificationDropdownRef}>
            <NotificationDropdown
              isOpen={isNotificationOpen}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onNotificationClick={handleNotificationClick}
              hasUnread={unreadCount > 0}
            />
          </div>
        </div>
        
        <div className="app-header-user-menu" ref={userDropdownRef}>
          <button 
            ref={avatarButtonRef}
            className="app-header-user-avatar-button" 
            aria-label="Личный кабинет"
            onClick={() => setIsUserDropdownOpen(prev => !prev)}
            aria-expanded={isUserDropdownOpen}
          >
            {userAvatar ? (
              <img src={userAvatar} alt={user?.username || 'Аватар пользователя'} className="header-user-avatar" />
            ) : (
              <UserPlaceholderIcon />
            )}
          </button>
          <div className={`app-header-dropdown ${isUserDropdownOpen ? 'open' : ''}`}> 
            {user && <div className="dropdown-user-info">Привет, {user.username}!</div>}
            <a href="/profile" className="dropdown-link" onClick={() => { setIsUserDropdownOpen(false); navigate('/profile'); }}>Профиль</a>
            <button 
              onClick={() => {
                onLogoutClick();
                setIsUserDropdownOpen(false);
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

export default memo(Header);