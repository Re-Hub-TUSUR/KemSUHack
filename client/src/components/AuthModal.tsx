import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';

const UserIcon = () => (
  <svg 
    className="auth-icon" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
  >
    <path 
      fill="currentColor"
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
    />
  </svg>
);

const EmailIcon = () => (
  <svg 
    className="auth-icon" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
  >
    <path 
      fill="currentColor"
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
    />
  </svg>
);

const LockIcon = () => (
  <svg 
    className="auth-icon" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
  >
    <path 
      fill="currentColor"
      d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
    />
  </svg>
);

const EyeOpenIcon = () => (
  <svg 
    className="auth-icon"
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
  >
    <path 
      fill="currentColor"
      d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"
    />
  </svg>
);

const EyeClosedIcon = () => (
  <svg 
    className="auth-icon" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
  >
    <path 
      fill="currentColor"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" 
    />
  </svg>
);

type LoginFormInputs = {
  email: string;
  password: string;
};

type RegisterFormInputs = {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
};

type AuthFormData = LoginFormInputs & Partial<RegisterFormInputs>;

type RegisterFieldErrors = FieldErrors<RegisterFormInputs>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AuthFormData) => Promise<void>;
  title: string;
  submitButtonText: string;
  onSwitchForm?: (targetForm: 'login' | 'register') => void; 
  onForgotPassword?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitButtonText,
  onSwitchForm,
  onForgotPassword,
}) => {
  const isRegister = title.toLowerCase().includes('регистрация');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<AuthFormData>({
    mode: 'onBlur',
    defaultValues: {
        email: "",
        password: "",
        username: "",
        confirm_password: ""
    }
  });

  const passwordValue = watch('password');

  useEffect(() => {
    if (isOpen) {
      reset({
        email: "",
        password: "",
        username: "",
        confirm_password: ""
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, reset]);


  const handleFormSubmit: SubmitHandler<AuthFormData> = async (data) => {
    try {
       const cleanData = {...data};
       if (!isRegister) {
           delete cleanData.username;
           delete cleanData.confirm_password;
       }
       await onSubmit(cleanData);
    } catch (err) {
        console.error("AuthModal submission error:", err);
    }
  };

  const registerErrors = errors as RegisterFieldErrors;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay auth-modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
            onClick={onClose}
            className="auth-modal-close-btn"
            disabled={isSubmitting}
            aria-label="Закрыть"
        >
            ×
        </button>
        <h2 className="auth-modal-title">{title}</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form" noValidate>

          {isRegister && (
            <div className={`form-group auth-form-group ${errors.username ? 'has-error' : ''}`}>
              <label htmlFor="username_auth" className="auth-label">Имя пользователя</label>
              <div className="input-wrapper auth-input-wrapper">
                  <UserIcon />
                  <input
                    type="text"
                    id="username_auth"
                    placeholder="Введите ваше имя пользователя"
                    className={`auth-input ${errors.username ? 'input-error' : ''}`}
                    {...register("username", { 
                        required: isRegister ? "Имя пользователя обязательно" : false,
                        minLength: isRegister ? { value: 3, message: "Минимум 3 символа" } : undefined
                    })}
                    disabled={isSubmitting}
                    autoComplete="username"
                  />
               </div>
              {errors.username && <span className="error-message auth-error-message">{errors.username.message}</span>}
            </div>
          )}

          <div className={`form-group auth-form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email_auth" className="auth-label">Email</label>
            <div className="input-wrapper auth-input-wrapper">
                <EmailIcon />
                <input
                    type="email"
                    id="email_auth"
                    placeholder="example@mail.com"
                    className={`auth-input ${errors.email ? 'input-error' : ''}`}
                    {...register("email", {
                        required: "Email обязателен",
                        pattern: { value: /^\S+@\S+\.\S+$/i, message: "Неверный формат email" }
                    })}
                    disabled={isSubmitting}
                    autoComplete="email"
                />
            </div>
             {errors.email && <span className="error-message auth-error-message">{errors.email.message}</span>}
          </div>

          <div className={`form-group auth-form-group ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password_auth" className="auth-label">Пароль</label>
             <div className="input-wrapper auth-input-wrapper">
                <LockIcon />
                <input
                    type={showPassword ? "text" : "password"}
                    id="password_auth"
                    placeholder={isRegister ? "Создайте надежный пароль" : "Введите ваш пароль"}
                    className={`auth-input ${errors.password ? 'input-error' : ''}`}
                    {...register("password", { 
                        required: "Пароль обязателен",
                        minLength: isRegister ? { value: 6, message: "Пароль должен быть не менее 6 символов" } : undefined
                    })}
                    disabled={isSubmitting}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button 
                  type="button" 
                  className="password-toggle-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
            </div>
            {errors.password && <span className="error-message auth-error-message">{errors.password.message}</span>}
          </div>

          {isRegister && (
            <div className={`form-group auth-form-group ${registerErrors.confirm_password ? 'has-error' : ''}`}>
              <label htmlFor="confirm_password_auth" className="auth-label">Подтвердите пароль</label>
              <div className="input-wrapper auth-input-wrapper">
                  <LockIcon />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password_auth"
                    placeholder="Повторите пароль"
                    className={`auth-input ${registerErrors.confirm_password ? 'input-error' : ''}`}
                    {...register("confirm_password", {
                        required: isRegister ? "Подтверждение пароля обязательно" : false,
                        validate: value => isRegister ? (value === passwordValue || "Пароли не совпадают") : true
                    })}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                   />
                   <button 
                    type="button" 
                    className="password-toggle-btn" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Скрыть подтверждение пароля" : "Показать подтверждение пароля"}
                    aria-pressed={showConfirmPassword}
                   >
                    {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </button>
               </div>
               {registerErrors.confirm_password && <span className="error-message auth-error-message">{registerErrors.confirm_password.message}</span>}
            </div>
          )}

          {!isRegister && onForgotPassword && (
            <div className="auth-form-extra-links">
              <button type="button" onClick={onForgotPassword} className="forgot-password-link">
                Забыли пароль?
              </button>
            </div>
          )}

          <button type="submit" className="primary-btn auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Обработка...' : submitButtonText}
          </button>

          {onSwitchForm && (
            <div className="auth-switch-form">
              {isRegister ? (
                <>
                  Уже есть аккаунт?{' '}
                  <button type="button" onClick={() => onSwitchForm('login')} className="switch-form-link">
                    Войти
                  </button>
                </>
              ) : (
                <>
                  Нет аккаунта?{' '}
                  <button type="button" onClick={() => onSwitchForm('register')} className="switch-form-link">
                    Зарегистрироваться
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;