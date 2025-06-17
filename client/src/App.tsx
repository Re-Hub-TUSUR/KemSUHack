import React, { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useDebounce } from './hooks/useDebounce';
import { useAuth } from './context/AuthContext';
import { useEvents } from './hooks/useEvents';
import { useEventActions } from './hooks/useEventActions';
import { useAuthModals } from './hooks/useAuthModals';

import './index.css'; 
import './styles/App.css';
import './styles/common.css';
import './styles/Header.css';
import './styles/Modal.css';
import './styles/EventList.css';
import './styles/EventDetailModal.css';
import './styles/EventFormModal.css';
import './styles/ControlBar.css';
import './styles/FilterModal.css';
import './styles/ConfirmModal.css';
import './styles/EventCalendar.css';
import './styles/TopNotification.css';
import './styles/BottomNavigationBar.css';
import './styles/MoreMenuModal.css';

import Header from './components/Header';
import AuthModal from './components/AuthModal';
import EventFilterModal from './components/EventFilter';
import ControlBar from './components/ControlBar';
import EventList from './components/EventList';
import EventCalendarView from './components/EventCalendarView';
import EventDetailModal from './components/EventDetailModal';
import EventFormModal from './components/EventFormModal';
import ConfirmModal from './components/ConfirmModal';
import TopNotification from './components/TopNotification';
import LandingPage from './components/landing/LandingPage';
import BottomNavigationBar from './components/BottomNavigationBar';
import MoreMenuModal from './components/MoreMenuModal';
import { EventsIconBottomNav, CalendarIconBottomNav } from './components/icons';

import { EventFilters } from './types';

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const NOTIFICATION_TIMEOUT = 5000;

type ViewMode = 'list' | 'calendar';
type NotificationData = {
  title: string;
  message: string;
  eventId?: number;
  key: number;
} | null;

const App = () => {
    const { isAuthenticated, currentUser, isLoading: authLoading, logout } = useAuth();
    
    const { isLoginOpen, isRegisterOpen, openLoginModal, openRegisterModal, closeLoginModal, closeRegisterModal, handleLoginSubmit, handleRegisterSubmit, handleSwitchAuthForm } = useAuthModals();

    const [filters, setFilters] = useState<EventFilters>({});
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    const { events, isLoading: isLoadingEvents, error: eventError, refetch: fetchEvents } = useEvents(filters, debouncedSearchTerm);
    const {
        selectedEvent, isDetailModalOpen, eventToEdit, isFormModalOpen, isConfirmModalOpen, isDeleting,
        handleViewDetails, handleCloseDetailModal, handleOpenAddForm, handleOpenEditForm, handleCloseFormModal,
        handleDeleteEvent, handleCloseConfirmModal, confirmDeleteAction, handleSaveEvent, handleImageDelete,
    } = useEventActions(fetchEvents);
    
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const [topNotification, setTopNotification] = useState<NotificationData>(null);
    const socketRef = useRef<Socket | null>(null);

    const showTopNotification = useCallback((title: string, message: string, eventId?: number) => {
        setTopNotification({ title, message, eventId, key: Date.now() });
    }, []);

    const handleCloseTopNotification = useCallback(() => {
        setTopNotification(null);
    }, []);

    const handleTopNotificationClick = useCallback((eventId?: number) => {
        if (eventId) {
            const eventToShow = events.find(e => e.id === eventId);
            if (eventToShow) handleViewDetails(eventToShow);
        }
        handleCloseTopNotification();
        window.focus();
    }, [events, handleViewDetails, handleCloseTopNotification]);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (topNotification) {
            timer = setTimeout(() => {
                handleCloseTopNotification();
            }, NOTIFICATION_TIMEOUT + 500);
        }
        return () => {
            if(timer) clearTimeout(timer);
        };
    }, [topNotification, handleCloseTopNotification]);
    
    useEffect(() => {
        if (isAuthenticated && !socketRef.current) {
            const newSocket = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
            newSocket.on('connect_error', (error) => { console.error('Ошибка подключения WebSocket:', error); toast.error("Не удалось подключиться к серверу уведомлений."); });
            newSocket.on('upcoming_event', (data) => showTopNotification(data.title, data.message, data.eventId));
            newSocket.on('new_event_added', (data) => showTopNotification("Новое мероприятие!", `Добавлено: "${data.eventTitle}".`, data.eventId));
            socketRef.current = newSocket;
        } else if (!isAuthenticated && socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        return () => {
            socketRef.current?.disconnect();
        };
    }, [isAuthenticated, showTopNotification]);

    const handleApplyFilters = useCallback((filtersToApply: EventFilters) => {
        setFilters(filtersToApply);
        setIsFilterModalOpen(false);
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({});
        setSearchTerm('');
        setIsFilterModalOpen(false);
    }, []);

    if (authLoading) {
        return <div style={{ textAlign: 'center', margin: '4rem 0', fontSize: '1.2em' }}>Загрузка...</div>;
    }

    return (
      <div className="app-container">
          {!isAuthenticated ? (
              <LandingPage onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />
          ) : (
            <>
              <Header user={currentUser} onLogoutClick={logout} onNavigate={setViewMode} viewMode={viewMode} />
              <div className="app-main-layout">
                <main className={`app-content-area ${ (typeof window !== 'undefined' && window.innerWidth <= 768) ? 'has-bottom-nav' : ''}`}>
                    <TopNotification notification={topNotification} onClose={handleCloseTopNotification} onClick={handleTopNotificationClick} />
                    <ControlBar
                        searchTerm={searchTerm}
                        onSearchChange={(e) => setSearchTerm(e.target.value)}
                        onFilterClick={() => setIsFilterModalOpen(true)}
                        onAddClick={handleOpenAddForm}
                        isAdmin={currentUser?.is_admin ?? false}
                        isFiltered={Object.values(filters).some(Boolean)}
                    />
                    {viewMode === 'list' ? (
                        <EventList events={events} isLoading={isLoadingEvents} error={eventError} onViewDetails={handleViewDetails} onEdit={currentUser?.is_admin ? handleOpenEditForm : undefined} onDelete={currentUser?.is_admin ? handleDeleteEvent : undefined} isAdmin={currentUser?.is_admin ?? false} />
                    ) : (
                        <EventCalendarView events={events} isLoading={isLoadingEvents} error={eventError} onViewDetails={handleViewDetails} />
                    )}
                </main>
              </div>
              <BottomNavigationBar activeView={viewMode} onMoreClick={() => setIsMoreMenuOpen(true)} EventsIconComp={EventsIconBottomNav} CalendarIconComp={CalendarIconBottomNav} onNavigate={setViewMode} />
            </>
          )}
          
          <AuthModal isOpen={isRegisterOpen} variant="register" onClose={closeRegisterModal} onSubmit={handleRegisterSubmit} title="Регистрация" submitButtonText="Зарегистрироваться" onSwitchForm={handleSwitchAuthForm} />
          <AuthModal isOpen={isLoginOpen} variant="login" onClose={closeLoginModal} onSubmit={handleLoginSubmit} title="Вход" submitButtonText="Войти" onSwitchForm={handleSwitchAuthForm} onForgotPassword={() => toast.info("Функция восстановления пароля в разработке.")} />
          
          {isAuthenticated && (
            <>
              <MoreMenuModal 
                isOpen={isMoreMenuOpen} 
                onClose={() => setIsMoreMenuOpen(false)} 
                onLogoutClick={logout}
                onProfileClick={() => toast.info("Страница профиля в разработке.")}
                onSettingsClick={() => toast.info("Страница настроек в разработке.")}
              />
              <EventDetailModal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} event={selectedEvent} />
              <EventFormModal isOpen={isFormModalOpen} onClose={handleCloseFormModal} onSubmit={handleSaveEvent} eventToEdit={eventToEdit} onDeleteImage={handleImageDelete} />
              <EventFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} initialFilters={filters} onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} />
              <ConfirmModal isOpen={isConfirmModalOpen} onClose={handleCloseConfirmModal} onConfirm={confirmDeleteAction} title="Подтвердить удаление" message="Вы уверены, что хотите удалить это мероприятие? Это действие необратимо." confirmText="Удалить" cancelText="Отмена" isLoading={isDeleting} />
            </>
          )}
          <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </div>
    );
};

export default App;