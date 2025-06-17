import React, { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';
import { useDebounce } from './hooks/useDebounce';
import { useAuth } from './context/AuthContext';

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

import { ToastContainer, toast } from 'react-toastify';
import { Event, EventFilters, EventFormData } from './types';

const EventsIconBottomNav = () => (
  <svg className="bottom-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
);
const CalendarIconBottomNav = () => (
    <svg className="bottom-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z"/></svg>
);

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
    const { isAuthenticated, currentUser, isLoading: authLoading, logout, fetchWithAuth, login, register } = useAuth();

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const [events, setEvents] = useState<Event[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
    const [eventError, setEventError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState<EventFilters>({});
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [eventToDeleteId, setEventToDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    
    const socketRef = useRef<Socket | null>(null);
    const [topNotification, setTopNotification] = useState<NotificationData>(null);
    const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const handleViewDetails = useCallback((event: Event | null) => {
       setSelectedEvent(event);
       setIsDetailModalOpen(!!event);
    }, []);

    const showTopNotification = useCallback((title: string, message: string, eventId?: number) => {
        if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
        setTopNotification({ title, message, eventId, key: Date.now() });
        notificationTimerRef.current = setTimeout(() => setTopNotification(null), NOTIFICATION_TIMEOUT + 500);
    }, []);

    const handleCloseTopNotification = useCallback(() => {
        if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
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
            if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
        };
    }, [isAuthenticated, showTopNotification]);

    const fetchEvents = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoadingEvents(true);
        setEventError(null);
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => value && queryParams.append(key, value as string));
        if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
        
        try {
            const response = await fetchWithAuth(`/api/events?${queryParams.toString()}`);
            if (!response.ok) throw new Error((await response.json()).error || 'Не удалось загрузить мероприятия');
            const data: Event[] = await response.json();
            setEvents(data);
        } catch (err) {
            if (!(err instanceof Error && err.message.includes('401'))) {
                setEventError(err instanceof Error ? err.message : 'Ошибка при загрузке');
            }
        } finally {
            setIsLoadingEvents(false);
        }
    }, [isAuthenticated, fetchWithAuth, filters, debouncedSearchTerm]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
    
    useEffect(() => {
        if (!isAuthenticated) {
            setEvents([]);
        }
    }, [isAuthenticated]);

    const handleOpenAddForm = () => { setEventToEdit(null); setIsFormModalOpen(true); };
    const handleOpenEditForm = (event: Event) => { setEventToEdit(event); setIsFormModalOpen(true); };
    const handleCloseDetailModal = () => { setIsDetailModalOpen(false); setSelectedEvent(null); };
    const handleCloseFormModal = () => { setIsFormModalOpen(false); setEventToEdit(null); };
    const handleDeleteEvent = (eventId: number) => { setEventToDeleteId(eventId); setIsConfirmModalOpen(true); };

    const confirmDeleteAction = async () => {
        if (eventToDeleteId === null) return;
        setIsDeleting(true);
        try {
            await fetchWithAuth(`/api/events/${eventToDeleteId}`, { method: 'DELETE' });
            fetchEvents();
            toast.success("Мероприятие успешно удалено!");
            if (selectedEvent?.id === eventToDeleteId) handleCloseDetailModal();
        } catch (err) {
            if (!(err instanceof Error && err.message.includes('401'))) {
                toast.error(err instanceof Error ? err.message : 'Ошибка удаления');
            }
        } finally {
            setIsConfirmModalOpen(false); setEventToDeleteId(null); setIsDeleting(false);
        }
    };

    const handleSaveEvent = async (formData: EventFormData, imageFile: File | null) => {
        const isEditing = !!eventToEdit;
        try {
            let savedEvent: Event;
            if (isEditing) {
                const response = await fetchWithAuth(`/api/events/${eventToEdit!.id}`, { method: 'PUT', body: JSON.stringify(formData) });
                savedEvent = await response.json();
                toast.success("Данные мероприятия успешно обновлены!");
            } else {
                const response = await fetchWithAuth('/api/events', { method: 'POST', body: JSON.stringify(formData) });
                savedEvent = await response.json();
                toast.success("Мероприятие успешно создано!");
            }

            if (imageFile && savedEvent.id) {
                const imageFormData = new FormData();
                imageFormData.append('image', imageFile);
                const imageResponse = await fetchWithAuth(`/api/events/${savedEvent.id}/upload_image`, { method: 'POST', body: imageFormData });
                if (!imageResponse.ok) {
                    toast.warn(`Мероприятие сохранено, но не удалось загрузить изображение: ${(await imageResponse.json()).error}`);
                }
            }
            fetchEvents();
            handleCloseFormModal();
        } catch (err) {
            if (!(err instanceof Error && err.message.includes('401'))) {
                toast.error(err instanceof Error ? err.message : 'Ошибка сохранения');
                throw err;
            }
        }
    };
    
    const handleImageDelete = async (eventId: number) => {
        try {
            await fetchWithAuth(`/api/events/${eventId}/image`, { method: 'DELETE' });
            fetchEvents();
            toast.success("Изображение успешно удалено!");
        } catch (err) {
            if (!(err instanceof Error && err.message.includes('401'))) {
                toast.error(err instanceof Error ? err.message : 'Ошибка удаления изображения');
                throw err;
            }
        }
    };

    const handleLoginSubmit = async (formData: Record<string, string>) => {
        try {
            await login(formData);
            setIsLoginOpen(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Неизвестная ошибка входа";
            toast.error(message);
            throw error;
        }
    };
    
    const handleRegisterSubmit = async (formData: Record<string, string>) => {
        try {
            await register(formData);
            setIsRegisterOpen(false);
            setIsLoginOpen(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Неизвестная ошибка регистрации";
            toast.error(message);
            throw error;
        }
    };

    const handleSwitchAuthForm = (target: 'login' | 'register') => {
        setIsLoginOpen(target === 'login');
        setIsRegisterOpen(target === 'register');
    };
    
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
              <LandingPage onLoginClick={() => setIsLoginOpen(true)} onRegisterClick={() => setIsRegisterOpen(true)} />
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
          
          <AuthModal isOpen={isRegisterOpen} onClose={() => { setIsRegisterOpen(false); }} onSubmit={handleRegisterSubmit} title="Регистрация" submitButtonText="Зарегистрироваться" onSwitchForm={handleSwitchAuthForm} />
          <AuthModal isOpen={isLoginOpen} onClose={() => { setIsLoginOpen(false); }} onSubmit={handleLoginSubmit} title="Вход" submitButtonText="Войти" onSwitchForm={handleSwitchAuthForm} onForgotPassword={() => toast.info("Функция восстановления пароля в разработке.")} />
          
          {isAuthenticated && (
            <>
              <MoreMenuModal isOpen={isMoreMenuOpen} onClose={() => setIsMoreMenuOpen(false)} onLogoutClick={logout} />
              <EventDetailModal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} event={selectedEvent} />
              <EventFormModal isOpen={isFormModalOpen} onClose={handleCloseFormModal} onSubmit={handleSaveEvent} eventToEdit={eventToEdit} onDeleteImage={handleImageDelete} />
              <EventFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} initialFilters={filters} onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} />
              <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDeleteAction} title="Подтвердить удаление" message="Вы уверены, что хотите удалить это мероприятие? Это действие необратимо." confirmText="Удалить" cancelText="Отмена" isLoading={isDeleting} />
            </>
          )}
          <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </div>
    );
};

export default App;