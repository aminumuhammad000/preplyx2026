import React, { useState, useEffect, useCallback } from 'react';
import {
  Users as UsersIcon,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  X,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Loader,
  TrendingUp,
  Hash,
  CreditCard,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import './Users.css';

/* ── Config ── */
const API_BASE_URL = 'http://localhost:5000/api';
const PAGE_SIZE = 10;

/* ── Types ── */
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: 'active' | 'suspended';
  createdAt: string;
  subscription?: { plan?: string };
}

type FilterType = 'all' | 'active' | 'suspended';
type ToastState = { message: string; type: 'success' | 'error' } | null;

/* ── Helpers ── */
const AVATAR_CLASSES = ['um-avatar-a', 'um-avatar-b', 'um-avatar-c', 'um-avatar-d', 'um-avatar-e'];

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const getAvatarClass = (name: string) => {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_CLASSES[code % AVATAR_CLASSES.length];
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const getPlanClass = (plan?: string) => {
  switch ((plan || '').toLowerCase()) {
    case 'basic':   return 'um-plan-basic';
    case 'premium': return 'um-plan-premium';
    case 'pro':     return 'um-plan-pro';
    default:        return 'um-plan-free';
  }
};

/* ══════════════════════════════════════
   SKELETON ROW
══════════════════════════════════════ */
const SkeletonRow: React.FC<{ idx: number }> = ({ idx }) => (
  <tr className="um-skeleton-row" style={{ opacity: 1 - idx * 0.1 }}>
    <td><div className="um-skeleton-bar" style={{ width: 24 }} /></td>
    <td>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="um-skeleton-circle" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div className="um-skeleton-bar" style={{ width: '70%' }} />
          <div className="um-skeleton-bar" style={{ width: '50%', height: 11 }} />
        </div>
      </div>
    </td>
    <td><div className="um-skeleton-bar" style={{ width: 110 }} /></td>
    <td><div className="um-skeleton-bar" style={{ width: 60 }} /></td>
    <td><div className="um-skeleton-bar" style={{ width: 90 }} /></td>
    <td><div className="um-skeleton-bar" style={{ width: 70 }} /></td>
    <td><div className="um-skeleton-bar" style={{ width: 80, marginLeft: 'auto' }} /></td>
  </tr>
);

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export const Users: React.FC = () => {
  const [users, setUsers]               = useState<User[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState<FilterType>('all');
  const [page, setPage]                 = useState(1);
  const [drawer, setDrawer]             = useState<User | null>(null);
  const [toast, setToast]               = useState<ToastState>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [deleting, setDeleting]         = useState(false);

  /* ── Fetch ── */
  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`);
      if (res.ok) setUsers(await res.json());
      else showToast('Failed to load users', 'error');
    } catch {
      showToast('Network error — check your connection', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Toast ── */
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  /* ── Status update ── */
  const updateStatus = async (userId: string, status: 'active' | 'suspended') => {
    const key = userId + status;
    setActionLoading(key);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, status } : u));
        if (drawer?._id === userId) setDrawer((p) => p ? { ...p, status } : p);
        showToast(`User ${status === 'active' ? 'activated' : 'suspended'} successfully`, 'success');
      } else {
        showToast('Failed to update user status', 'error');
      }
    } catch {
      showToast('Network error — could not update status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Delete user ── */
  const deleteUser = async (user: User) => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${user._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        if (drawer?._id === user._id) setDrawer(null);
        setDeleteConfirm(null);
        showToast(`${user.name} has been permanently deleted`, 'success');
      } else {
        showToast('Failed to delete user', 'error');
      }
    } catch {
      showToast('Network error — could not delete user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Derived ── */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || (u.phone || '').includes(q);
    const matchFilter = filter === 'all' || (u.status || 'active') === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageUsers  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalUsers     = users.length;
  const activeUsers    = users.filter((u) => (u.status || 'active') === 'active').length;
  const suspendedUsers = users.filter((u) => u.status === 'suspended').length;
  const newThisMonth   = users.filter((u) => {
    const d = new Date(u.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  /* ── Page range helper ── */
  const pageRange = (): (number | '…')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (page > 3) pages.push('…');
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="um-page">

      {/* ───── HERO HEADER ───── */}
      <div className="um-hero">
        <div className="um-hero-left">
          <div className="um-hero-eyebrow">
            <UsersIcon size={12} />
            Student Accounts
          </div>
          <h1>User Management</h1>
          <p className="um-hero-sub">
            View, search, approve, and suspend all student accounts registered on the Preplyx platform.
          </p>
        </div>
        <div className="um-hero-right">
          <button className="um-btn-refresh" onClick={() => fetchUsers(true)} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'um-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button className="um-btn-export">
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ───── STATS ───── */}
      <div className="um-stats">
        <div className="um-stat-card total">
          <div className="um-stat-icon total"><UsersIcon size={24} color="#fff" /></div>
          <div className="um-stat-info">
            <div className="um-stat-label">Total Students</div>
            <div className="um-stat-value">{loading ? '—' : totalUsers.toLocaleString()}</div>
          </div>
        </div>
        <div className="um-stat-card active">
          <div className="um-stat-icon active"><UserCheck size={24} color="#fff" /></div>
          <div className="um-stat-info">
            <div className="um-stat-label">Active Accounts</div>
            <div className="um-stat-value">{loading ? '—' : activeUsers.toLocaleString()}</div>
          </div>
        </div>
        <div className="um-stat-card suspended">
          <div className="um-stat-icon suspended"><UserX size={24} color="#fff" /></div>
          <div className="um-stat-info">
            <div className="um-stat-label">Suspended</div>
            <div className="um-stat-value">{loading ? '—' : suspendedUsers.toLocaleString()}</div>
          </div>
        </div>
        <div className="um-stat-card new">
          <div className="um-stat-icon new"><TrendingUp size={24} color="#fff" /></div>
          <div className="um-stat-info">
            <div className="um-stat-label">New This Month</div>
            <div className="um-stat-value">{loading ? '—' : newThisMonth.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* ───── TABLE CARD ───── */}
      <div className="um-card">

        {/* Toolbar */}
        <div className="um-toolbar">
          <div className="um-toolbar-left">
            {/* Search */}
            <div className="um-search-wrap">
              <Search size={15} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search name, email or phone…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                  onClick={() => setSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="um-filter-pill">
              {(['all', 'active', 'suspended'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  className={`um-filter-btn ${filter === f ? 'um-filter-active' : ''}`}
                  onClick={() => { setFilter(f); setPage(1); }}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="um-toolbar-right">
            <span className="um-result-count">
              {loading ? '' : `${filtered.length} user${filtered.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="um-table-scroller">
          <table className="um-table">
            <thead>
              <tr>
                <th><Hash size={12} /></th>
                <th>Student</th>
                <th>Phone Number</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }, (_, i) => <SkeletonRow key={i} idx={i} />)
              ) : pageUsers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="um-empty">
                      <div className="um-empty-icon">
                        <UsersIcon size={32} />
                      </div>
                      <h3>{search || filter !== 'all' ? 'No users found' : 'No users yet'}</h3>
                      <p>
                        {search || filter !== 'all'
                          ? 'Try adjusting your search or filter to find students.'
                          : 'Students will appear here once they register.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageUsers.map((user, idx) => {
                  const status   = user.status || 'active';
                  const isActive = status === 'active';
                  const rowNum   = (page - 1) * PAGE_SIZE + idx + 1;
                  const busyActivate = actionLoading === user._id + 'active';
                  const busySuspend  = actionLoading === user._id + 'suspended';

                  return (
                    <tr key={user._id}>
                      {/* # */}
                      <td><span className="um-row-num">{rowNum}</span></td>

                      {/* Student */}
                      <td>
                        <div className="um-user-cell">
                          <div className={`um-avatar ${getAvatarClass(user.name)}`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="um-user-name">{user.name}</div>
                            <div className="um-user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td>
                        {user.phone
                          ? <span className="um-phone">{user.phone}</span>
                          : <span className="um-phone-nil">—</span>
                        }
                      </td>

                      {/* Plan */}
                      <td>
                        <span className={`um-plan-chip ${getPlanClass(user.subscription?.plan)}`}>
                          <CreditCard size={11} />
                          {user.subscription?.plan || 'Free'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td><span className="um-date">{formatDate(user.createdAt)}</span></td>

                      {/* Status */}
                      <td>
                        <span className={`um-status ${status}`}>
                          <span className="um-status-dot" />
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="um-actions">
                          {/* View */}
                          <button
                            className="um-icon-btn um-btn-view"
                            title="View student profile"
                            onClick={() => setDrawer(user)}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Activate */}
                          {!isActive && (
                            <button
                              className="um-icon-btn um-btn-activate"
                              title="Activate account"
                              disabled={busyActivate}
                              onClick={() => updateStatus(user._id, 'active')}
                            >
                              {busyActivate
                                ? <Loader size={14} className="um-spin" />
                                : <UserCheck size={15} />
                              }
                            </button>
                          )}

                          {/* Suspend */}
                          {isActive && (
                            <button
                              className="um-icon-btn um-btn-suspend"
                              title="Suspend account"
                              disabled={busySuspend}
                              onClick={() => updateStatus(user._id, 'suspended')}
                            >
                              {busySuspend
                                ? <Loader size={14} className="um-spin" />
                                : <UserX size={15} />
                              }
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            className="um-icon-btn um-btn-delete"
                            title="Delete user"
                            onClick={() => setDeleteConfirm(user)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="um-pagination">
            <span className="um-page-info">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="um-page-buttons">
              <button className="um-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={15} />
              </button>
              {pageRange().map((p, i) =>
                p === '…'
                  ? <span key={`sep-${i}`} className="um-page-sep">…</span>
                  : (
                    <button
                      key={p}
                      className={`um-page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p as number)}
                    >
                      {p}
                    </button>
                  )
              )}
              <button className="um-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════
          SIDE DRAWER — STUDENT PROFILE
      ═══════════════════════════════════ */}
      {drawer && (
        <>
          <div className="um-drawer-backdrop" onClick={() => setDrawer(null)} />
          <aside className="um-drawer">
            {/* Gradient accent bar */}
            <div className="um-drawer-accent" />

            {/* Drawer header */}
            <div className="um-drawer-header">
              <span className="um-drawer-title">Student Profile</span>
              <button className="um-drawer-close" onClick={() => setDrawer(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="um-drawer-body">
              {/* Profile hero */}
              <div className="um-drawer-profile">
                <div className={`um-drawer-avatar ${getAvatarClass(drawer.name)}`}>
                  {getInitials(drawer.name)}
                </div>
                <div className="um-drawer-name">{drawer.name}</div>
                <div className="um-drawer-email">{drawer.email}</div>
                <div className="um-drawer-badges">
                  <span className={`um-status ${drawer.status || 'active'}`} style={{ fontSize: 12 }}>
                    <span className="um-status-dot" />
                    {(drawer.status || 'active') === 'active' ? 'Active' : 'Suspended'}
                  </span>
                  <span className={`um-plan-chip ${getPlanClass(drawer.subscription?.plan)}`}>
                    <CreditCard size={11} />
                    {drawer.subscription?.plan || 'Free'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="um-drawer-section">
                <div className="um-drawer-section-title">Account Details</div>
                <div className="um-detail-list">
                  <div className="um-detail-item">
                    <span className="um-detail-key"><Mail size={14} /> Email</span>
                    <span className="um-detail-val">{drawer.email}</span>
                  </div>
                  <div className="um-detail-item">
                    <span className="um-detail-key"><Phone size={14} /> Phone</span>
                    <span className="um-detail-val">{drawer.phone || 'Not provided'}</span>
                  </div>
                  <div className="um-detail-item">
                    <span className="um-detail-key"><ShieldCheck size={14} /> Role</span>
                    <span className="um-detail-val" style={{ textTransform: 'capitalize' }}>{drawer.role}</span>
                  </div>
                  <div className="um-detail-item">
                    <span className="um-detail-key"><Calendar size={14} /> Joined</span>
                    <span className="um-detail-val">{formatDate(drawer.createdAt)}</span>
                  </div>
                  <div className="um-detail-item">
                    <span className="um-detail-key"><Hash size={14} /> User ID</span>
                    <span className="um-detail-val" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {drawer._id.slice(-12).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="um-drawer-footer">
                <div className="um-drawer-section-title" style={{ padding: '20px 0 0', marginBottom: 0 }}>
                  Manage Account
                </div>

                {(drawer.status || 'active') === 'active' ? (
                  <button
                    className="um-drawer-action-btn um-drawer-btn-suspend"
                    disabled={actionLoading === drawer._id + 'suspended'}
                    onClick={() => updateStatus(drawer._id, 'suspended')}
                  >
                    {actionLoading === drawer._id + 'suspended'
                      ? <Loader size={16} className="um-spin" />
                      : <UserX size={16} />
                    }
                    {actionLoading === drawer._id + 'suspended' ? 'Suspending…' : 'Suspend Account'}
                  </button>
                ) : (
                  <button
                    className="um-drawer-action-btn um-drawer-btn-activate"
                    disabled={actionLoading === drawer._id + 'active'}
                    onClick={() => updateStatus(drawer._id, 'active')}
                  >
                    {actionLoading === drawer._id + 'active'
                      ? <Loader size={16} className="um-spin" />
                      : <UserCheck size={16} />
                    }
                    {actionLoading === drawer._id + 'active' ? 'Activating…' : 'Activate Account'}
                  </button>
                )}

                <button className="um-drawer-action-btn um-drawer-btn-delete" onClick={() => { setDrawer(null); setDeleteConfirm(drawer); }}>
                  <Trash2 size={16} />
                  Delete User Permanently
                </button>

                <button className="um-drawer-action-btn um-drawer-btn-close" onClick={() => setDrawer(null)}>
                  <X size={16} /> Close
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ═══════════════════════════════════
          DELETE CONFIRMATION MODAL
      ═══════════════════════════════════ */}
      {deleteConfirm && (
        <div className="um-confirm-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="um-confirm-card" onClick={e => e.stopPropagation()}>
            <div className="um-confirm-icon-wrap">
              <AlertTriangle size={32} />
            </div>
            <h3 className="um-confirm-title">Delete User Account?</h3>
            <p className="um-confirm-text">
              You are about to permanently delete <strong>{deleteConfirm.name}</strong>'s account.
              This action cannot be undone. All associated data will be removed.
            </p>
            <div className="um-confirm-user">
              <div className={`um-mini-avatar ${getAvatarClass(deleteConfirm.name)}`}>{getInitials(deleteConfirm.name)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{deleteConfirm.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{deleteConfirm.email}</div>
              </div>
            </div>
            <div className="um-confirm-actions">
              <button
                className="um-confirm-btn um-confirm-no"
                disabled={deleting}
                onClick={() => setDeleteConfirm(null)}
              >
                No, Keep User
              </button>
              <button
                className="um-confirm-btn um-confirm-yes"
                disabled={deleting}
                onClick={() => deleteUser(deleteConfirm)}
              >
                {deleting ? <Loader size={16} className="um-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`um-toast um-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};
