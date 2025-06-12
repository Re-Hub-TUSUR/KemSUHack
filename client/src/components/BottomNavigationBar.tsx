import React, { JSX } from 'react';
import '../styles/BottomNavigationBar.css';

const MoreIcon = () => (
  <svg className="bottom-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
);

interface NavItemProps {
  icon: JSX.Element;
  text: string;
  isActive?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, isActive, onClick }) => {
  const commonProps = {
    className: `bottom-nav-item ${isActive ? 'active' : ''}`,
    onClick: onClick,
  };

  return (
    <button {...commonProps} type="button" aria-label={text}>
      <span className="bottom-nav-icon-wrapper">{icon}</span>
      <span className="bottom-nav-text">{text}</span>
    </button>
  );
};

interface BottomNavigationBarProps {
  activeView: 'list' | 'calendar';
  onMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
  EventsIconComp: React.FC;
  CalendarIconComp: React.FC;
  onNavigate: (view: 'list' | 'calendar') => void; 
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ 
    activeView, 
    onMoreClick,
    EventsIconComp,
    CalendarIconComp,
    onNavigate 
}) => {
  return (
    <nav className="bottom-navigation-bar">
      <NavItem 
        icon={<EventsIconComp />} 
        text="Мероприятия" 
        isActive={activeView === 'list'} 
        onClick={() => onNavigate('list')}
      />
      <NavItem 
        icon={<CalendarIconComp />} 
        text="Расписание" 
        isActive={activeView === 'calendar'} 
        onClick={() => onNavigate('calendar')}
      />
      <NavItem 
        icon={<MoreIcon />} 
        text="Еще" 
        onClick={onMoreClick}
      />
    </nav>
  );
};

export default BottomNavigationBar;