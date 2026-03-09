import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, auth } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="auth-form">
      <h2>Login to Taidon SQL Editor</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={auth.isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={auth.isLoading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="auth-button"
          disabled={auth.isLoading}
        >
          {auth.isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="auth-switch">
        <p>Don't have an account?{' '}
          <button 
            type="button" 
            className="switch-button"
            onClick={onSwitchToRegister}
            disabled={auth.isLoading}
          >
            Sign up
          </button>
        </p>
      </div>

      <div className="demo-credentials">
        <p><strong>Demo credentials:</strong></p>
        <p>Email: demo@example.com</p>
        <p>Password: password</p>
      </div>
    </div>
  );
}