import { useApp } from '../contexts/AppContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthWrapper() {
  const { authFormType, setAuthFormType } = useApp();

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {authFormType === 'login' ? (
          <LoginForm onSwitchToRegister={() => setAuthFormType('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthFormType('login')} />
        )}
      </div>
    </div>
  );
}