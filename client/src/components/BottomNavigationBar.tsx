import React, { JSX } from 'react';
import '../styles/BottomNavigationBar.css';

const MoreIcon = () => (
  <svg className="bottom-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
);

interface NavItemProps {
  href?: string;
  icon: JSX.Element;
  text: string;
  isActive?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  isButton?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, text, isActive, onClick, isButton }) => {
  const commonProps = {
    className: `bottom-nav-item ${isActive ? 'active' : ''} ${isButton ? 'is-button' : ''}`,
    onClick: onClick,
  };

  if (isButton) {
    return (
      <button {...commonProps} type="button" aria-label={text}>
        <span className="bottom-nav-icon-wrapper">{icon}</span>
        <span className="bottom-nav-text">{text}</span>
      </button>
    );
  }

  return (
    <a href={href} {...commonProps}>
      <span className="bottom-nav-icon-wrapper">{icon}</span>
      <span className="bottom-nav-text">{text}</span>
    </a>
  );
};

interface BottomNavigationBarProps {
  activeRoute?: string;
  onMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
  EventsIconComp: React.FC;
  NewsIconComp: React.FC;
  RewardsIconComp: React.FC;
  onNavigate: (path: string) => void; 
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ 
    activeRoute, 
    onMoreClick,
    EventsIconComp,
    NewsIconComp,
    RewardsIconComp,
    onNavigate 
}) => {
  return (
    <nav className="bottom-navigation-bar">
      <NavItem 
        href="/events" 
        icon={<EventsIconComp />} 
        text="Мероприятия" 
        isActive={activeRoute === '/events'} 
        onClick={(e) => { e.preventDefault(); onNavigate('/events'); }}
      />
      <NavItem 
        href="/news" 
        icon={<NewsIconComp />} 
        text="Новости" 
        isActive={activeRoute === '/news'} 
        onClick={(e) => { e.preventDefault(); onNavigate('/news'); }}
      />
      <NavItem 
        href="/rewards" 
        icon={<RewardsIconComp />} 
        text="Награды" 
        isActive={activeRoute === '/rewards'}
        onClick={(e) => { e.preventDefault(); onNavigate('/rewards'); }}
      />
      <NavItem 
        icon={<MoreIcon />} 
        text="Еще" 
        onClick={onMoreClick}
        isButton={true}
      />
    </nav>
  );
};

export default BottomNavigationBar;