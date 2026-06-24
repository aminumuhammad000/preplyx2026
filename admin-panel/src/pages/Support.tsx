import React, { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle,
  Send,
  Loader,
  User as UserIcon,
  HelpCircle
} from 'lucide-react';
import './Support.css';

const API_BASE_URL = 'http://localhost:5000/api';

/* ── Types ── */
interface User {
  _id: string;
  name: string;
  email: string;
}

interface SupportTicket {
  _id: string;
  user: User;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/support/tickets`);
      if (res.ok) {
        setTickets(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const activeTicket = tickets.find(t => t._id === activeTicketId);

  // Pre-fill the reply text if an adminReply already exists
  useEffect(() => {
    if (activeTicket) {
      setReplyText(activeTicket.adminReply || '');
    }
  }, [activeTicket]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = async (status: string, message?: string) => {
    if (!activeTicket) return;
    setSubmitting(true);
    try {
      const payload: any = { status };
      if (message !== undefined) payload.adminReply = message;

      const res = await fetch(`${API_BASE_URL}/admin/support/tickets/${activeTicket._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { ticket: updatedTicket } = await res.json();
        setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        showToast(`Ticket marked as ${status}`);
      }
    } catch (error) {
      console.error('Failed to update ticket', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    // Send reply and automatically mark as resolved
    handleUpdateStatus('resolved', replyText);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <div className="sp-page">
      {/* ───── HERO HEADER ───── */}
      <div className="sp-hero">
        <div className="sp-hero-left">
          <div className="sp-hero-eyebrow">
            <LifeBuoy size={12} />
            Help Desk
          </div>
          <h1>Support Center</h1>
          <p className="sp-hero-sub">
            Manage student inquiries, bug reports, and assistance requests. Respond to tickets to help your students succeed.
          </p>
        </div>
      </div>

      <div className="sp-container">
        {/* ───── LEFT PANE: TICKET LIST ───── */}
        <div className="sp-list-pane">
          <div className="sp-list-header">
            <span className="sp-list-title">All Tickets ({tickets.length})</span>
          </div>

          <div className="sp-tickets-scroll">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Loader size={24} className="sp-spin" style={{ color: '#3b82f6', margin: '0 auto' }} />
              </div>
            ) : tickets.length > 0 ? (
              tickets.map(ticket => (
                <div 
                  key={ticket._id} 
                  className={`sp-ticket-card ${activeTicketId === ticket._id ? 'active' : ''}`}
                  onClick={() => setActiveTicketId(ticket._id)}
                >
                  <div className="sp-ticket-top">
                    <div className="sp-ticket-subject">{ticket.subject}</div>
                    <div className="sp-ticket-date">{formatDate(ticket.createdAt)}</div>
                  </div>
                  <div className="sp-ticket-user">
                    <UserIcon size={12} /> {ticket.user?.name || 'Unknown User'}
                  </div>
                  <div className="sp-ticket-badges">
                    <span className={`sp-badge ${ticket.status}`}>
                      {ticket.status.replace('-', ' ')}
                    </span>
                    <span className={`sp-badge ${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 12px' }} />
                <p>Inbox zero! No active tickets.</p>
              </div>
            )}
          </div>
        </div>

        {/* ───── RIGHT PANE: TICKET DETAILS ───── */}
        <div className="sp-detail-pane">
          {activeTicket ? (
            <>
              {/* Header */}
              <div className="sp-detail-header">
                <div className="sp-detail-title">{activeTicket.subject}</div>
                <div className="sp-detail-meta">
                  <div className="sp-detail-user-info">
                    <div className="sp-avatar">
                      {activeTicket.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {activeTicket.user?.name || 'Unknown User'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {activeTicket.user?.email || 'No email provided'}
                      </div>
                    </div>
                  </div>
                  <div className="sp-ticket-date">
                    Opened {formatDate(activeTicket.createdAt)}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="sp-detail-body">
                <div className="sp-message-label">
                  <MessageSquare size={14} /> Student Message
                </div>
                <div className="sp-message-bubble">
                  <p>{activeTicket.message}</p>
                </div>

                {activeTicket.adminReply && (
                  <>
                    <div className="sp-message-label" style={{ justifyContent: 'flex-end', paddingRight: '4px' }}>
                      <CheckCircle size={14} /> Admin Reply
                    </div>
                    <div className="sp-reply-bubble">
                      <p>{activeTicket.adminReply}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Reply Area */}
              <div className="sp-reply-area">
                <textarea 
                  className="sp-reply-textarea" 
                  placeholder="Type your response here... (This will be sent to the student)"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  disabled={submitting}
                />
                <div className="sp-reply-actions">
                  {activeTicket.status !== 'closed' && activeTicket.status !== 'resolved' && (
                    <button 
                      className="sp-btn sp-btn-outline"
                      onClick={() => handleUpdateStatus('in-progress')}
                      disabled={submitting || activeTicket.status === 'in-progress'}
                    >
                      <Clock size={16} /> Mark In-Progress
                    </button>
                  )}
                  
                  <button 
                    className="sp-btn sp-btn-primary"
                    onClick={handleSendReply}
                    disabled={submitting || !replyText.trim() || activeTicket.adminReply === replyText}
                  >
                    {submitting ? <Loader size={16} className="sp-spin" /> : <Send size={16} />}
                    {activeTicket.adminReply ? 'Update Reply' : 'Send & Resolve'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="sp-detail-empty">
              <div className="sp-detail-icon"><HelpCircle size={32} /></div>
              <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>No Ticket Selected</h3>
              <p>Select a support ticket from the list to view its details and respond.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="sp-toast">
          <CheckCircle size={18} />
          {toast}
        </div>
      )}
    </div>
  );
};
