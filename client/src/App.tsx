import React, { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';
import { useDebounce } from './hooks/useDebounce';

import './index.css'; 

import './styles/App.css'
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
import './styles/Sidebar.css';
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
import { ToastContainer, toast } from 'react-toastify';
import { fetchWithAuth as fetchWithAuthHelper } from './utils/fetchWithAuth';
import { User, Event, EventFilters, EventFormData } from './types';

import LandingPage from './components/landing/LandingPage';
import Sidebar from './components/Sidebar';
import BottomNavigationBar from './components/BottomNavigationBar';
import MoreMenuModal from './components/MoreMenuModal';


const EventsIconBottomNav = () => (
  <svg className="bottom-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
);
const NewsIconBottomNav = () => (
  <svg className="bottom-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
);
const TrophyIconBottomNav = () => (
  <svg className="bottom-nav-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20.5 3A1.5 1.5 0 0019 4.5V5H5V4.5A1.5 1.5 0 003.5 3h-1A1.5 1.5 0 001 4.5V8c0 1.92 1.21 3.54 3 4.23V20.5A1.5 1.5 0 005.5 22h13a1.5 1.5 0 001.5-1.5V12.23c1.79-.69 3-2.31 3-4.23V4.5A1.5 1.5 0 0020.5 3h-1zm-4.5 5H8V6h8v2zM4 8V5h1v3zm15 0V5h1v3z"/></svg>
);


const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const NOTIFICATION_TIMEOUT = 5000;

type NotificationData = {
  title: string;
  message: string;
  eventId?: number;
  key: number;
} | null;

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

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

    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const socketRef = useRef<Socket | null>(null);
    const [topNotification, setTopNotification] = useState<NotificationData>(null);
    const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [activeRoute, setActiveRoute] = useState("/events"); 

    const handleLogout = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        setEvents([]);
        setFilters({});
        setSearchTerm('');
        setIsSidebarOpenMobile(false);
        setIsSidebarCollapsed(false);
        toast.info("Вы вышли из системы.");
    }, []);

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
        try {
            return await fetchWithAuthHelper(url, options, handleLogout);
        } catch (error) {
            if (error instanceof Error && error.message.includes('401')) {
            } else if (error instanceof Error) {
                 toast.error(`Сетевая ошибка: ${error.message}`);
            } else {
                 toast.error("Неизвестная сетевая ошибка.");
            }
            throw error;
        }
    }, [handleLogout]);
    
    const requestNotificationPermission = useCallback(async () => {
        let currentPermission = Notification.permission;
        if (!('Notification' in window)) {
            toast.warn("Ваш браузер не поддерживает уведомления.");
            setNotificationPermission('denied');
            return 'denied';
        }
        if (currentPermission === 'default') {
            currentPermission = await Notification.requestPermission();
            setNotificationPermission(currentPermission);
            if (currentPermission === 'granted') {
                toast.info("Разрешение на уведомления получено!");
            } else {
                toast.warn("Вы отклонили разрешение на уведомления.");
            }
        } else if (currentPermission === 'denied') {
             toast.warn("Уведомления заблокированы в настройках браузера.");
        }
        return currentPermission;
    }, []);

    const handleViewDetails = useCallback((event: Event | null) => {
       setSelectedEvent(event);
       setIsDetailModalOpen(!!event);
    }, []);

    const showTopNotification = useCallback((title: string, message: string, eventId?: number) => {
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }
        setTopNotification({ title, message, eventId, key: Date.now() });
        notificationTimerRef.current = setTimeout(() => {
             setTopNotification(null);
             notificationTimerRef.current = null;
        }, NOTIFICATION_TIMEOUT + 500);
    }, []);

    const handleCloseTopNotification = useCallback(() => {
         if (notificationTimerRef.current) {
             clearTimeout(notificationTimerRef.current);
             notificationTimerRef.current = null;
         }
        setTopNotification(null);
    }, []);

     const handleTopNotificationClick = useCallback((eventId?: number) => {
         if (eventId) {
             const eventToShow = events.find(e => e.id === eventId);
             if (eventToShow) handleViewDetails(eventToShow);
             else console.warn(`Событие ${eventId} не найдено в списке.`);
         }
         handleCloseTopNotification();
         window.focus();
     }, [events, handleViewDetails, handleCloseTopNotification]);

     useEffect(() => {
         if ('Notification' in window) {
             setNotificationPermission(Notification.permission);
         }
     }, []);

    useEffect(() => {
        if (isAuthenticated && !socketRef.current) {
             const newSocket = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
             newSocket.on('connect', async () => {
                await requestNotificationPermission();
             });
             newSocket.on('disconnect', (reason) => { console.log('WebSocket отключен:', reason); });
             newSocket.on('connect_error', (error) => { console.error('Ошибка подключения WebSocket:', error); toast.error("Не удалось подключиться к серверу уведомлений."); });
             newSocket.on('upcoming_event', (data: { eventId: number; title: string; message: string }) => {
                showTopNotification(data.title, data.message, data.eventId);
             });
             newSocket.on('new_event_added', (data: { eventId: number; eventTitle: string }) => {
                 const title = "Новое мероприятие!";
                 const message = `Добавлено: "${data.eventTitle}". Нажмите, чтобы узнать подробности.`;
                 showTopNotification(title, message, data.eventId);
             });
             socketRef.current = newSocket;
        } else if (!isAuthenticated && socketRef.current) {
             socketRef.current.disconnect();
             socketRef.current = null;
        }
        return () => {
             if (socketRef.current) {
                 socketRef.current?.off('connect');
                 socketRef.current?.off('disconnect');
                 socketRef.current?.off('connect_error');
                 socketRef.current?.off('upcoming_event');
                 socketRef.current?.off('new_event_added');
                 socketRef.current.disconnect();
                 socketRef.current = null;
             }
             if (notificationTimerRef.current) {
                 clearTimeout(notificationTimerRef.current);
             }
        };
    }, [isAuthenticated, requestNotificationPermission, showTopNotification, handleCloseTopNotification, handleTopNotificationClick]);

    useEffect(() => {
        const tokenFromStorage = localStorage.getItem('authToken');
        if (tokenFromStorage) {
            setAuthToken(tokenFromStorage);
        } else {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authToken) {
            setAuthLoading(true);
            fetchWithAuth('/api/me')
                .then(async response => {
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                         if (response.status !== 401) {
                             throw new Error(errorData.error || `Ошибка проверки пользователя: ${response.status}`);
                         }
                         return null;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.user) {
                        setCurrentUser(data.user);
                        setIsAuthenticated(true);
                        setAuthError(null);
                    } else if (!localStorage.getItem('authToken')) {
                        setIsAuthenticated(false);
                        setCurrentUser(null);
                    }
                })
                .catch((err) => {
                     if (!(err instanceof Error && err.message.includes('401 Unauthorized'))) {
                        console.error("Error fetching /api/me:", err);
                     }
                })
                .finally(() => { setAuthLoading(false); });
        } else {
             setIsAuthenticated(false);
             setCurrentUser(null);
             setAuthLoading(false);
             setEvents([]);
        }
    }, [authToken, fetchWithAuth]);

    const fetchEvents = useCallback(async (currentFilters: EventFilters, currentSearchTerm: string) => {
        if (!isAuthenticated) {
            setEvents([]);
            return;
        };
        setIsLoadingEvents(true);
        setEventError(null);
        const queryParams = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value) {
                queryParams.append(key, value as string);
            }
        });
        if (currentSearchTerm) {
            queryParams.append('search', currentSearchTerm);
        }
        const queryString = queryParams.toString();
        const url = `/api/events${queryString ? `?${queryString}` : ''}`;
        try {
            const response = await fetchWithAuth(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Не удалось загрузить мероприятия');
            }
            const data: Event[] = await response.json();
            setEvents(data);
        } catch (err) {
             if (!(err instanceof Error && err.message.includes('401'))) {
                 const message = err instanceof Error ? err.message : 'Ошибка при загрузке мероприятий';
                 console.error("Error in fetchEvents:", err);
                 setEventError(message);
                 setEvents([]);
             }
        } finally {
            setIsLoadingEvents(false);
        }
    }, [fetchWithAuth, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchEvents(filters, debouncedSearchTerm);
        } else {
             setEvents([]);
        }
    }, [isAuthenticated, fetchEvents, filters, debouncedSearchTerm]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleOpenFilterModal = () => setIsFilterModalOpen(true);
    const handleCloseFilterModal = () => setIsFilterModalOpen(false);

    const handleApplyFilters = useCallback((filtersToApply: EventFilters) => {
        setFilters(filtersToApply);
        handleCloseFilterModal();
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({});
        setSearchTerm('');
        handleCloseFilterModal();
    }, []);

    const handleOpenAddForm = () => {
        setEventToEdit(null);
        setIsFormModalOpen(true);
    };
     const handleOpenEditForm = (event: Event) => {
        setEventToEdit(event);
        setIsFormModalOpen(true);
    };
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedEvent(null);
    };
     const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEventToEdit(null);
    };

    const handleDeleteEvent = (eventId: number) => {
        setEventToDeleteId(eventId);
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteAction = async () => {
        if (eventToDeleteId === null) return;
        setIsDeleting(true);
        try {
            const response = await fetchWithAuth(`/api/events/${eventToDeleteId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Ошибка удаления мероприятия');
            }
            fetchEvents(filters, searchTerm);
            toast.success("Мероприятие успешно удалено!");
            if (selectedEvent?.id === eventToDeleteId) {
                handleCloseDetailModal();
            }
        } catch (err) {
            if (!(err instanceof Error && err.message.includes('401'))) {
                 const message = err instanceof Error ? err.message : 'Произошла ошибка удаления';
                 toast.error(message);
            }
        } finally {
            setIsConfirmModalOpen(false);
            setEventToDeleteId(null);
            setIsDeleting(false);
        }
    };

    const cancelDeleteAction = () => {
        setIsConfirmModalOpen(false);
        setEventToDeleteId(null);
    };

    const handleSaveEvent = async (formData: EventFormData) => {
        const url = eventToEdit ? `/api/events/${eventToEdit.id}` : '/api/events';
        const method = eventToEdit ? 'PUT' : 'POST';
        try {
            const response = await fetchWithAuth(url, { method, body: JSON.stringify(formData) });
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || `Ошибка ${eventToEdit ? 'обновления' : 'создания'} мероприятия`);
            }
            fetchEvents(filters, searchTerm);
            toast.success(eventToEdit ? "Мероприятие успешно обновлено!" : "Мероприятие успешно создано!");
            handleCloseFormModal();
        } catch (err) {
             if (!(err instanceof Error && err.message.includes('401'))) {
                 const message = err instanceof Error ? err.message : 'Произошла ошибка сохранения';
                 toast.error(message);
                 console.error("Save Event Error:", err);
             }
        }
    };

    const handleRegisterSubmit = async (formData: Record<string, string>) => {
         setAuthError(null);
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Ошибка регистрации');
            }
            setIsRegisterOpen(false);
            toast.success(data.message || 'Регистрация успешна! Теперь вы можете войти.');
            setIsLoginOpen(true);
        } catch (err) {
             const message = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
             setAuthError(message);
             toast.error(message);
             throw err;
        }
    };

    const handleLoginSubmit = async (formData: Record<string, string>) => {
         setAuthError(null);
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Ошибка входа');
            }
            if (!data.access_token || !data.user) {
                 throw new Error('Сервер не вернул токен или данные пользователя');
            }
            localStorage.setItem('authToken', data.access_token);
            setAuthToken(data.access_token);
            setIsLoginOpen(false);
            toast.success(`Добро пожаловать, ${data.user.username}!`);
        } catch (err) {
             const message = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
             setAuthError(message);
             toast.error(message);
             throw err;
        }
    };

    const handleSwitchAuthForm = (targetForm: 'login' | 'register') => {
        if (targetForm === 'login') {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        } else {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }
        setAuthError(null); 
    };
    
    const handleForgotPassword = () => {
        console.log("Forgot password clicked");
        toast.info("Функция восстановления пароля в разработке.");
    };

    const handleNavigate = (path: string) => {
        console.log(`Navigating to: ${path}`);
        setActiveRoute(path);
        setIsSidebarOpenMobile(false); 
        setIsMoreMenuOpen(false);
    };

    const toggleMobileSidebar = () => {
        setIsSidebarOpenMobile(!isSidebarOpenMobile);
    };

    const toggleDesktopSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    if (authLoading) {
        return <div style={{ textAlign: 'center', margin: '4rem 0', fontSize: '1.2em' }}>Загрузка...</div>;
    }

    const isFiltered = Object.values(filters).some(value => value !== '' && value !== undefined && value !== null);

    return (
      <div className={`app-container ${isSidebarOpenMobile ? 'sidebar-mobile-active' : ''} ${isSidebarCollapsed ? 'sidebar-desktop-collapsed' : ''}`}>
          {!isAuthenticated ? (
              <LandingPage 
                  onLoginClick={() => setIsLoginOpen(true)}
                  onRegisterClick={() => setIsRegisterOpen(true)}
              />
          ) : (
            <>
              <Header
                  user={currentUser}
                  onLogoutClick={handleLogout}
              />
              <div className={`app-main-layout ${isSidebarOpenMobile ? 'sidebar-mobile-open' : ''}`}>
                <Sidebar 
                    user={currentUser} 
                    onLogoutClick={handleLogout}
                    activeRoute={activeRoute}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={toggleDesktopSidebar}
                />
                <main 
                    className={`app-content-area 
                                ${isSidebarOpenMobile ? 'sidebar-open-content-pusher' : ''} 
                                ${ (typeof window !== 'undefined' && window.innerWidth <= 768) ? 'has-bottom-nav' : ''}
                                ${isSidebarCollapsed ? 'sidebar-collapsed-content' : ''}`
                    } 
                    onClick={() => isSidebarOpenMobile && setIsSidebarOpenMobile(false) }
                >
                  <TopNotification
                      notification={topNotification}
                      onClose={handleCloseTopNotification}
                      onClick={handleTopNotificationClick}
                  />
                  <ControlBar
                      searchTerm={searchTerm}
                      onSearchChange={handleSearchChange}
                      onFilterClick={handleOpenFilterModal}
                      onAddClick={handleOpenAddForm}
                      isAdmin={currentUser?.is_admin ?? false}
                      isFiltered={isFiltered}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                  />
                  
                  {viewMode === 'list' && (
                      <EventList
                          events={events}
                          isLoading={isLoadingEvents}
                          error={eventError}
                          onViewDetails={handleViewDetails}
                          onEdit={currentUser?.is_admin ? handleOpenEditForm : undefined}
                          onDelete={currentUser?.is_admin ? handleDeleteEvent : undefined}
                          isAdmin={currentUser?.is_admin ?? false}
                      />
                  )}
                  {viewMode === 'calendar' && (
                      <EventCalendarView
                          events={events}
                          isLoading={isLoadingEvents}
                          error={eventError}
                          onViewDetails={handleViewDetails}
                      />
                  )}
                </main>
              </div>
              <BottomNavigationBar 
                activeRoute={activeRoute} 
                onMoreClick={() => setIsMoreMenuOpen(true)}
                EventsIconComp={EventsIconBottomNav}
                NewsIconComp={NewsIconBottomNav}
                RewardsIconComp={TrophyIconBottomNav}
                onNavigate={handleNavigate}
              />
            </>
          )}
          
          <AuthModal 
            isOpen={isRegisterOpen} 
            onClose={() => { setIsRegisterOpen(false); setAuthError(null); }} 
            onSubmit={handleRegisterSubmit} 
            title="Регистрация" 
            submitButtonText="Зарегистрироваться"
            onSwitchForm={handleSwitchAuthForm}
          />
          <AuthModal 
            isOpen={isLoginOpen} 
            onClose={() => { setIsLoginOpen(false); setAuthError(null); }} 
            onSubmit={handleLoginSubmit} 
            title="Вход" 
            submitButtonText="Войти" 
            onSwitchForm={handleSwitchAuthForm}
            onForgotPassword={handleForgotPassword}
          />
          
          {isAuthenticated && (
            <>
              <MoreMenuModal 
                isOpen={isMoreMenuOpen} 
                onClose={() => setIsMoreMenuOpen(false)} 
                onLogoutClick={handleLogout} 
                onNavigate={handleNavigate}
              />
              <EventDetailModal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} event={selectedEvent} />
              <EventFormModal isOpen={isFormModalOpen} onClose={handleCloseFormModal} onSubmit={handleSaveEvent} eventToEdit={eventToEdit} />
              <EventFilterModal
                    isOpen={isFilterModalOpen}
                    onClose={handleCloseFilterModal}
                    initialFilters={filters}
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleResetFilters}
              />
              <ConfirmModal
                  isOpen={isConfirmModalOpen}
                  onClose={cancelDeleteAction}
                  onConfirm={confirmDeleteAction}
                  title="Подтвердить удаление"
                  message="Вы уверены, что хотите удалить это мероприятие? Это действие необратимо."
                  confirmText="Удалить"
                  cancelText="Отмена"
                  isLoading={isDeleting}
              />
            </>
          )}
          
          <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
          {isSidebarOpenMobile && <div className="mobile-sidebar-overlay active" onClick={toggleMobileSidebar}></div>}
      </div>
    );
};

export default App;