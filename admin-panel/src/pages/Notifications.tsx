import React, { useState, useEffect, useCallback } from 'react';
import {
  BellRing,
  Send,
  Info,
  CheckCircle,
  AlertTriangle,
  Gift,
  Award,
  Loader,
  XCircle
} from 'lucide-react';
import './Notifications.css';

const API_BASE_URL = 'http://localhost:5000/api';

/* ── Types ── */
interface Broadcast {
  _id: string;
  title: string;
  message: string;
  type: string;
  targetAudience: string;
  targetEmail?: string;
  createdAt: string;
}

type ToastState = { message: string; type: 'success' | 'error' } | null;

export const Notifications: React.FC = () => {
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetAudience, setTargetAudience] = useState('all');
  const [targetEmail, setTargetEmail] = useState('');
  const [users, setUsers] = useState<{email: string, name: string}[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      // Fetch both history and users list concurrently
      const [historyRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/notifications`),
        fetch(`${API_BASE_URL}/admin/users`)
      ]);
      
      if (historyRes.ok) {
        setHistory(await historyRes.json());
      }
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const showToast = (msg: string, t: 'success' | 'error') => {
    setToast({ message: msg, type: t });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    if (targetAudience === 'specific' && !targetEmail.trim()) {
      showToast('Please enter an email address for the specific user.', 'error');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          message, 
          type, 
          targetAudience, 
          targetEmail: targetAudience === 'specific' ? targetEmail : undefined 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(prev => [data.broadcast, ...prev]);
        setTitle('');
        setMessage('');
        setType('info');
        setTargetEmail('');
        showToast(`Broadcast sent successfully! Reached ${data.usersReached || 0} user(s).`, 'success');
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Failed to send broadcast.', 'error');
      }
    } catch (error) {
      showToast('Network error while sending.', 'error');
    } finally {
      setSending(false);
    }
  };

  const getIconForType = (typeStr: string) => {
    switch (typeStr) {
      case 'success': return <CheckCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'promo': return <Gift size={20} />;
      case 'achievement': return <Award size={20} />;
      default: return <Info size={20} />;
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <div className="nt-page">
      {/* ───── HERO HEADER ───── */}
      <div className="nt-hero">
        <div className="nt-hero-left">
          <div className="nt-hero-eyebrow">
            <BellRing size={12} />
            Global Broadcasts
          </div>
          <h1>System Notifications</h1>
          <p className="nt-hero-sub">
            Compose and send notifications to all registered students instantly. Messages appear directly on their dashboard.
          </p>
        </div>
      </div>

      <div className="nt-grid">
        {/* ───── COMPOSE FORM ───── */}
        <div className="nt-card">
          <div className="nt-card-header">
            <h2 className="nt-card-title">Compose Broadcast</h2>
            <p className="nt-card-subtitle">Draft a new message to send to everyone.</p>
          </div>
          
          <form onSubmit={handleSend}>
            <div className="nt-form-group">
              <label className="nt-label">Message Type</label>
              <select 
                className="nt-select" 
                value={type} 
                onChange={e => setType(e.target.value)}
              >
                <option value="info">Informational (Blue)</option>
                <option value="success">Success (Green)</option>
                <option value="warning">Warning / Alert (Orange)</option>
                <option value="promo">Promotional (Purple)</option>
                <option value="achievement">Achievement / Fun (Red)</option>
              </select>
            </div>

            <div className="nt-form-group">
              <label className="nt-label">Target Audience</label>
              <select 
                className="nt-select" 
                value={targetAudience} 
                onChange={e => setTargetAudience(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="active">Verified (Active) Users</option>
                <option value="suspended">Suspended Users</option>
                <option value="specific">Specific User</option>
              </select>
            </div>

            {targetAudience === 'specific' && (
              <div className="nt-form-group">
                <label className="nt-label">Select User Email</label>
                <select 
                  className="nt-select" 
                  value={targetEmail}
                  onChange={e => setTargetEmail(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Choose a user --</option>
                  {users.map((u, i) => (
                    <option key={i} value={u.email}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="nt-form-group">
              <label className="nt-label">Notification Title</label>
              <input 
                type="text" 
                className="nt-input" 
                placeholder="E.g., Scheduled Maintenance Tomorrow" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={60}
                required
              />
            </div>

            <div className="nt-form-group">
              <label className="nt-label">Message Details</label>
              <textarea 
                className="nt-textarea" 
                placeholder="Write the full message here..." 
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={300}
                required
              />
            </div>

            <button type="submit" className="nt-btn-submit" disabled={sending || !title.trim() || !message.trim()}>
              {sending ? <Loader size={18} className="nt-spin" /> : <Send size={18} />}
              {sending ? 'Sending...' : 'Send Broadcast Now'}
            </button>
          </form>
        </div>

        {/* ───── BROADCAST HISTORY ───── */}
        <div className="nt-card">
          <div className="nt-card-header">
            <h2 className="nt-card-title">Broadcast History</h2>
            <p className="nt-card-subtitle">Recent notifications sent to students.</p>
          </div>

          <div className="nt-history-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Loader size={30} className="nt-spin" style={{ color: '#db2777', margin: '0 auto' }} />
              </div>
            ) : history.length > 0 ? (
              history.map(item => (
                <div key={item._id} className="nt-history-item">
                  <div className={`nt-icon-wrap ${item.type}`}>
                    {getIconForType(item.type)}
                  </div>
                  <div className="nt-history-content">
                    <div className="nt-history-header">
                      <div className="nt-history-title">{item.title}</div>
                      <div className="nt-history-date">{formatDate(item.createdAt)}</div>
                    </div>
                    <div className="nt-history-message">{item.message}</div>
                    <div className="nt-history-target">
                      <small style={{ color: '#64748b', fontWeight: 600 }}>
                        Target: {item.targetAudience === 'specific' ? item.targetEmail : item.targetAudience}
                      </small>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="nt-empty">
                <div className="nt-empty-icon"><BellRing size={28} /></div>
                <h3>No broadcasts yet</h3>
                <p>When you send notifications, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`nt-toast nt-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};
