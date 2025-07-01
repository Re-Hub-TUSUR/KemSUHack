import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import UserProfileCard from '../components/profile/UserProfileCard';
import UserEventsCard from '../components/profile/UserEventsCard';
import SecurityCard from '../components/profile/SecurityCard';
import NotificationsCard from '../components/profile/NotificationsCard';
import Header from '../components/Header';
import BottomNavigationBar from '../components/BottomNavigationBar';
import MoreMenuModal from '../components/MoreMenuModal';
import { EventsIconBottomNav, CalendarIconBottomNav } from '../components/icons';
import '../styles/profile/ProfilePage.css';
import { Event } from '../types';

const mockUpcomingEvents: Event[] = [];
const mockPastEvents: Event[] = [];

const ProfilePage = () => {
    const { currentUser, logout, updateUser, changePassword, updateUserSettings } = useAuth();
    const navigate = useNavigate();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = React.useState(false);

    const handleAvatarChange = async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            await updateUser(formData);
            toast.success("Аватар успешно обновлен!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Ошибка загрузки аватара");
        }
    };

    const handleProfileUpdate = async (data: { username: string; email: string }) => {
        try {
            await updateUser(data);
            toast.success("Профиль успешно обновлен!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Ошибка обновления профиля");
        }
    };

    const handleChangePassword = async (data: any) => {
        try {
            await changePassword(data);
            toast.success("Пароль успешно изменен!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Ошибка смены пароля");
            throw error;
        }
    };
    
    const handleToggleNotifications = async (enabled: boolean) => {
        try {
            await updateUserSettings({ notifications_enabled: enabled });
            toast.success(`Уведомления ${enabled ? 'включены' : 'выключены'}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Ошибка обновления настроек");
            throw error;
        }
    };

    const handleNavigate = (view: 'list' | 'calendar') => {
        navigate('/', { state: { view: view } });
    };

    if (!currentUser) {
        return <div>Загрузка...</div>;
    }

    const mainRole = currentUser.is_admin ? "Администратор" : "Участник";

    return (
        <div className="profile-page-container">
            <Header 
                user={currentUser} 
                onLogoutClick={logout} 
                onNavigate={handleNavigate} 
                viewMode={null}
            />
            
            <main className={`profile-page-main ${ (typeof window !== 'undefined' && window.innerWidth <= 768) ? 'has-bottom-nav' : ''}`}>
                <div className="profile-page-header">
                    <h1>Личный кабинет</h1>
                </div>
                <div className="profile-grid">
                    <div className="profile-grid-main">
                        <UserProfileCard
                            user={currentUser}
                            onAvatarChange={handleAvatarChange}
                            onProfileUpdate={handleProfileUpdate}
                            stats={{
                                events_visited: 0,
                                main_role: mainRole
                            }}
                        />
                        <UserEventsCard
                            upcomingEvents={mockUpcomingEvents}
                            pastEvents={mockPastEvents}
                        />
                    </div>
                    <div className="profile-grid-sidebar">
                        <SecurityCard onSubmit={handleChangePassword} />
                        <NotificationsCard 
                            currentUser={currentUser}
                            onToggleNotifications={handleToggleNotifications}
                        />
                    </div>
                </div>
            </main>
            
            <BottomNavigationBar 
                activeView={null}
                onMoreClick={() => setIsMoreMenuOpen(true)} 
                EventsIconComp={EventsIconBottomNav} 
                CalendarIconComp={CalendarIconBottomNav} 
                onNavigate={handleNavigate} 
            />
             <MoreMenuModal 
                isOpen={isMoreMenuOpen} 
                onClose={() => setIsMoreMenuOpen(false)} 
                onLogoutClick={logout}
                onProfileClick={() => navigate('/profile')}
            />

            <ToastContainer position="bottom-right" autoClose={4000} theme="colored" />
        </div>
    );
};

export default ProfilePage;