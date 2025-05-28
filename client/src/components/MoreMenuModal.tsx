import React from 'react';
import '../styles/MoreMenuModal.css'; 

const ProfileIcon = () => (
  <svg className="more-menu-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
);
const HomeIcon = () => (
  <svg className="more-menu-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
);
const DiscussionsIcon = () => (
  <svg className="more-menu-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
);
const LogoutIcon = () => (
  <svg className="more-menu-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
);
const SettingsIcon = () => (
    <svg className="more-menu-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.08.49 0 .61.22l2 3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
);


interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
  onNavigate: (path: string) => void;
}

const MoreMenuModal: React.FC<MoreMenuModalProps> = ({ isOpen, onClose, onLogoutClick, onNavigate }) => {
  if (!isOpen) return null;

  const handleLogout = () => {
    onLogoutClick();
    onClose();
  };

  const handleNavigation = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div className={`more-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="more-menu-content" onClick={(e) => e.stopPropagation()}>
        <button className="more-menu-item" onClick={() => handleNavigation('/')}>
          <HomeIcon /> Главная
        </button>
        <button className="more-menu-item" onClick={() => handleNavigation('/profile')}>
          <ProfileIcon /> Профиль
        </button>
        <button className="more-menu-item" onClick={() => handleNavigation('/discussions')}>
          <DiscussionsIcon /> Обсуждения
        </button>
        <button className="more-menu-item" onClick={() => handleNavigation('/settings')}>
          <SettingsIcon /> Настройки
        </button>
        <button className="more-menu-item more-menu-logout" onClick={handleLogout}>
          <LogoutIcon /> Выход
        </button>
        <button className="more-menu-close-btn" onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  );
};

export default MoreMenuModal;