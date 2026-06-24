import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import './Profile.css';

const API_BASE_URL = 'http://localhost:5000/api';

interface ProfileData {
  name: string;
  email: string;
}

export const Profile: React.FC = () => {
  /* ── State ── */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fetching, setFetching] = useState(true);

  const token = localStorage.getItem('adminToken');

  /* ── Helpers ── */
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const showProfileMsg = (type: 'success' | 'error', text: string) => {
    setProfileMsg({ type, text });
    setTimeout(() => setProfileMsg(null), 4000);
  };

  const showPasswordMsg = (type: 'success' | 'error', text: string) => {
    setPasswordMsg({ type, text });
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  /* ── Fetch current profile on mount ── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: ProfileData = await res.json();
          setName(data.name || '');
          setEmail(data.email || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [token]);

  /* ── Save profile (name + email) ── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showProfileMsg('error', 'Username cannot be empty.');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      // Update localStorage so the Layout header reflects the new name
      const stored = localStorage.getItem('adminUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('adminUser', JSON.stringify({ ...parsed, name: data.name, email: data.email }));
      }
      showProfileMsg('success', 'Profile updated successfully!');
    } catch (err: any) {
      showProfileMsg('error', err.message || 'Something went wrong.');
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Change password ── */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showPasswordMsg('error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      showPasswordMsg('error', 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showPasswordMsg('error', 'New passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password update failed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showPasswordMsg('success', 'Password changed successfully!');
    } catch (err: any) {
      showPasswordMsg('error', err.message || 'Something went wrong.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Loader2 size={32} style={{ animation: 'pf-spin 0.8s linear infinite', color: '#7c3aed' }} />
      </div>
    );
  }

  return (
    <div className="pf-page">
      {/* ── Hero ── */}
      <div className="pf-hero">
        <div className="pf-avatar-circle">{name.charAt(0).toUpperCase() || 'A'}</div>
        <div className="pf-hero-text">
          <h1>{name || 'Admin'}</h1>
          <p>{email || 'No email set'} &nbsp;·&nbsp; Full Access Administrator</p>
        </div>
      </div>

      <div className="pf-cards">
        {/* ── Card 1: Account Details ── */}
        <div className="pf-card">
          <h2 className="pf-card-title">
            <UserIcon size={18} /> Account Details
          </h2>

          {profileMsg && (
            <div className={`pf-alert pf-alert-${profileMsg.type}`}>
              {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="pf-grid">
              <div className="pf-form-group">
                <label className="pf-label">Username</label>
                <div className="pf-input-wrap">
                  <UserIcon className="pf-input-icon" size={16} />
                  <input
                    type="text"
                    className="pf-input"
                    placeholder="Enter username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={profileLoading}
                  />
                </div>
              </div>
              <div className="pf-form-group">
                <label className="pf-label">Email Address</label>
                <div className="pf-input-wrap">
                  <Mail className="pf-input-icon" size={16} />
                  <input
                    type="email"
                    className="pf-input"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={profileLoading}
                  />
                </div>
              </div>
            </div>
            <div className="pf-actions">
              <button type="submit" className="pf-btn-primary" disabled={profileLoading}>
                {profileLoading ? <Loader2 size={16} className="pf-spinner" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* ── Card 2: Change Password ── */}
        <div className="pf-card">
          <h2 className="pf-card-title">
            <ShieldCheck size={18} /> Change Password
          </h2>

          {passwordMsg && (
            <div className={`pf-alert pf-alert-${passwordMsg.type}`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="pf-grid">
              <div className="pf-form-group full-width">
                <label className="pf-label">Current Password</label>
                <div className="pf-input-wrap">
                  <Lock className="pf-input-icon" size={16} />
                  <input
                    type="password"
                    className="pf-input"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={passwordLoading}
                  />
                </div>
              </div>
              <div className="pf-form-group">
                <label className="pf-label">New Password</label>
                <div className="pf-input-wrap">
                  <KeyRound className="pf-input-icon" size={16} />
                  <input
                    type="password"
                    className="pf-input"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={passwordLoading}
                  />
                </div>
                <p className="pf-hint">At least 8 characters.</p>
              </div>
              <div className="pf-form-group">
                <label className="pf-label">Confirm New Password</label>
                <div className="pf-input-wrap">
                  <KeyRound className="pf-input-icon" size={16} />
                  <input
                    type="password"
                    className="pf-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={passwordLoading}
                  />
                </div>
              </div>
            </div>
            <div className="pf-actions">
              <button type="submit" className="pf-btn-primary" disabled={passwordLoading}>
                {passwordLoading ? <Loader2 size={16} className="pf-spinner" /> : <ShieldCheck size={16} />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
