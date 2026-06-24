import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, LogIn, Loader2, ShieldAlert } from 'lucide-react';
import logoImg from '../assets/logo.png';
import './Login.css';

const API_BASE_URL = 'http://localhost:5000/api';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      // Save token and user info to localStorage (using same key as preplyx for consistency)
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('preplyx_token', data.token); // Share token with preplyx
      localStorage.setItem('adminUser', JSON.stringify({
        id: data._id,
        name: data.name,
        email: data.email
      }));

      // Redirect to home/dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Glows */}
      <div className="login-aura-indigo" />
      <div className="login-aura-rose" />

      <div className="login-card">
        {/* Logo / Branding */}
        <div className="login-brand">
          <img src={logoImg} alt="Preplyx Logo" className="login-logo-img" />
          <div className="login-brand-text">
            <h1 className="login-brand-name">Preplyx</h1>
            <span className="login-brand-tagline">Admin Panel</span>
          </div>
        </div>

        <div className="login-title-wrapper">
          <h1 className="login-title">Control Center</h1>
          <p className="login-subtitle">Please authenticate to access the admin console</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-alert">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="login-form-group">
            <label className="login-label" htmlFor="username">Username</label>
            <div className="login-input-wrapper">
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
              <UserIcon className="login-input-icon" size={18} />
            </div>
          </div>

          {/* Password Input */}
          <div className="login-form-group">
            <label className="login-label" htmlFor="password">Password</label>
            <div className="login-input-wrapper">
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <Lock className="login-input-icon" size={18} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="login-spinner" size={18} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Login</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
