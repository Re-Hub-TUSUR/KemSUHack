import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './components/landing/LandingPage';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import { useAuthModals } from './hooks/useAuthModals';
import AuthModal from './components/AuthModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { 
        isLoginOpen, 
        isRegisterOpen, 
        openLoginModal, 
        openRegisterModal, 
        closeLoginModal, 
        closeRegisterModal, 
        handleLoginSubmit, 
        handleRegisterSubmit, 
        handleSwitchAuthForm 
    } = useAuthModals();

    if (authLoading) {
        return <div style={{ textAlign: 'center', margin: '4rem 0', fontSize: '1.2em' }}>Загрузка...</div>;
    }

    return (
        <>
            <Routes>
                {isAuthenticated ? (
                    <>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        {/* Можно добавить маршрут для страницы настроек */}
                        {/* <Route path="/settings" element={<SettingsPage />} /> */}
                    </>
                ) : (
                    <Route path="*" element={<LandingPage onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />} />
                )}
            </Routes>

            {/* Модальные окна аутентификации остаются здесь, так как они глобальные */}
            <AuthModal 
                isOpen={isRegisterOpen} 
                variant="register" 
                onClose={closeRegisterModal} 
                onSubmit={handleRegisterSubmit} 
                title="Регистрация" 
                submitButtonText="Зарегистрироваться" 
                onSwitchForm={handleSwitchAuthForm} 
            />
            <AuthModal 
                isOpen={isLoginOpen} 
                variant="login" 
                onClose={closeLoginModal} 
                onSubmit={handleLoginSubmit} 
                title="Вход" 
                submitButtonText="Войти" 
                onSwitchForm={handleSwitchAuthForm} 
                onForgotPassword={() => toast.info("Функция восстановления пароля в разработке.")} 
            />
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
        </>
    );
};

export default App;