import React, { JSX } from 'react';
import '../styles/BottomNavigationBar.css';
import { MoreIcon } from './icons';

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