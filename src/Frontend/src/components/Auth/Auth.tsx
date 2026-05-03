import { useState } from 'react';
import { authService } from '../../services/api';

interface AuthProps {
  onAuth: (userName: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await authService.login(userName, password);
      } else {
        await authService.register(userName, email, password);
      }
      onAuth(userName);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            title="Enter your Reset username"
            required
          />
        </div>

        {!isLogin && (
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              title="Enter the email address used for your account"
              required
            />
          </div>
        )}

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            title="Enter your account password"
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          title={isLogin ? 'Log into your Reset account' : 'Create a new Reset account'}
        >
          {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        title={isLogin ? 'Switch to the registration form' : 'Switch to the login form'}
      >
        Switch to {isLogin ? 'Register' : 'Login'}
      </button>
    </div>
  );
};