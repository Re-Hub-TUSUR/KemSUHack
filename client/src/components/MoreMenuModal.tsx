import React from 'react';
import '../styles/MoreMenuModal.css'; 
import { ProfileIcon, LogoutIcon, SettingsIcon } from './icons';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

const MoreMenuModal: React.FC<MoreMenuModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogoutClick,
  onProfileClick,
  onSettingsClick,
}) => {
  if (!isOpen) return null;

  const handleLogout = () => {
    onLogoutClick();
    onClose();
  };
  
  const handleProfile = () => {
    onProfileClick();
    onClose();
  };
  
  const handleSettings = () => {
    onSettingsClick();
    onClose();
  };

  return (
    <div className={`more-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="more-menu-content" onClick={(e) => e.stopPropagation()}>
        <button className="more-menu-item" onClick={handleProfile}>
          <ProfileIcon /> Профиль
        </button>
        <button className="more-menu-item" onClick={handleSettings}>
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