import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet as WalletIcon,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  RefreshCw,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Settings,
  Coins,
  ArrowRight,
  Info
} from 'lucide-react';
import './Wallet.css';

/* ── Config ── */
const API_BASE_URL = 'http://localhost:5000/api';
const PAGE_SIZE = 10;

/* ── Types ── */
interface UserInfo {
  name: string;
  email: string;
}

interface Transaction {
  _id: string;
  user?: UserInfo;
  type: 'funding' | 'spending' | 'bonus' | 'transfer';
  amount: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

interface WalletStats {
  totalDeposits: number;
  totalVirtualAccounts: number;
  totalUnlocks: number;
}

interface WalletConfig {
  examUnlockFee: number;
  welcomeBonus: number;
  virtualAccountFee: number;
}

type ToastState = { message: string; type: 'success' | 'error' } | null;

/* ── Helpers ── */
const getInitials = (name: string) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const getAvatarClass = (name: string) => {
  if (!name) return 'wm-avatar-1';
  const code = name.charCodeAt(0) || 0;
  const classes = ['wm-avatar-1', 'wm-avatar-2', 'wm-avatar-3', 'wm-avatar-4', 'wm-avatar-5'];
  return classes[code % classes.length];
};

const formatCurrency = (amount: number) => {
  return `₦ ${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/* ══════════════════════════════════════
   SKELETON ROW COMPONENT
   ══════════════════════════════════════ */
const SkeletonRow: React.FC<{ idx: number }> = ({ idx }) => (
  <tr style={{ opacity: 1 - idx * 0.1 }}>
    <td><div className="wm-skeleton-bar" style={{ width: 64 }} /></td>
    <td>
      <div className="wm-avatar-container">
        <div className="wm-skeleton-circle" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div className="wm-skeleton-bar" style={{ width: '120px' }} />
          <div className="wm-skeleton-bar" style={{ width: '80px', height: 11 }} />
        </div>
      </div>
    </td>
    <td><div className="wm-skeleton-bar" style={{ width: 80 }} /></td>
    <td><div className="wm-skeleton-bar" style={{ width: 90 }} /></td>
    <td><div className="wm-skeleton-bar" style={{ width: 130 }} /></td>
    <td><div className="wm-skeleton-bar" style={{ width: 70 }} /></td>
    <td><div className="wm-skeleton-bar" style={{ width: 80 }} /></td>
  </tr>
);

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */
export const Wallet: React.FC = () => {
  // Stats & Transactions
  const [stats, setStats] = useState<WalletStats>({ totalDeposits: 0, totalVirtualAccounts: 0, totalUnlocks: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTxns, setTotalTxns] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingFees, setSavingFees] = useState(false);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  
  // Modals & Popups
  const [drawer, setDrawer] = useState<Transaction | null>(null);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  
  // Fee configuration form
  const [feeConfig, setFeeConfig] = useState<WalletConfig>({
    examUnlockFee: 200,
    welcomeBonus: 500,
    virtualAccountFee: 100
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page to 1 when searching
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Toast auto-close helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Fetch Wallet Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`${API_BASE_URL}/admin/wallet/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        throw new Error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
      showToast('Error loading wallet stats', 'error');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoadingTxns(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString()
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (typeFilter !== 'All') params.append('type', typeFilter.toLowerCase());
      if (statusFilter !== 'All') params.append('status', statusFilter.toLowerCase());

      const res = await fetch(`${API_BASE_URL}/admin/wallet/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotalTxns(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Transactions fetch error:', error);
      showToast('Error loading transactions', 'error');
    } finally {
      setLoadingTxns(false);
    }
  }, [page, debouncedSearch, typeFilter, statusFilter]);

  // Fetch Fees Config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/wallet/config`);
      if (res.ok) {
        const data = await res.json();
        setFeeConfig({
          examUnlockFee: data.examUnlockFee ?? 200,
          welcomeBonus: data.welcomeBonus ?? 500,
          virtualAccountFee: data.virtualAccountFee ?? 100
        });
      }
    } catch (error) {
      console.error('Config fetch error:', error);
    }
  }, []);

  // Fetch all initial data
  useEffect(() => {
    fetchStats();
    fetchConfig();
  }, [fetchStats, fetchConfig]);

  // Fetch transactions on dependency change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchTransactions(), fetchConfig()]);
    setRefreshing(false);
    showToast('Dashboard data refreshed successfully!');
  };

  // Configure Fees Submit
  const handleSaveFees = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingFees(true);
      const res = await fetch(`${API_BASE_URL}/admin/wallet/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feeConfig)
      });
      if (res.ok) {
        showToast('Fees configuration saved successfully!');
        setFeeModalOpen(false);
      } else {
        throw new Error('Failed to update config');
      }
    } catch (error) {
      console.error('Save fees error:', error);
      showToast('Failed to save fees configuration', 'error');
    } finally {
      setSavingFees(false);
    }
  };

  // Copy ID to clipboard
  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast('Transaction ID copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transaction data to export', 'error');
      return;
    }

    const headers = 'Transaction ID,Student Name,Student Email,Type,Amount,Date,Status,Reference\n';
    const rows = transactions
      .map((txn) => {
        const studentName = txn.user?.name ? `"${txn.user.name}"` : 'Unknown';
        const studentEmail = txn.user?.email || 'N/A';
        const dateStr = formatDate(txn.createdAt);
        return `${txn._id},${studentName},${studentEmail},${txn.type},${txn.amount},"${dateStr}",${txn.status},${txn.reference || ''}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully!');
  };

  return (
    <div className="wm-page">
      {/* ── Toast Alert ── */}
      {toast && (
        <div className="wm-toast-container">
          <div className={`wm-toast ${toast.type === 'error' ? 'error' : ''}`}>
            <Info size={16} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Hero Banner Header ── */}
      <header className="wm-hero">
        <div className="wm-hero-left">
          <div className="wm-hero-eyebrow">
            <Coins size={14} />
            <span>Platform Economy</span>
          </div>
          <h1>Wallet & Payments</h1>
          <p className="wm-hero-sub">
            Monitor virtual accounts, student deposits, exam package purchases, and platform configs.
          </p>
        </div>
        <div className="wm-hero-right">
          <button
            className={`wm-btn-refresh ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh Data"
            disabled={refreshing}
          >
            <RefreshCw size={18} />
          </button>
          <button className="wm-btn-configure" onClick={() => setFeeModalOpen(true)}>
            <Settings size={18} />
            Configure Fees
          </button>
          <button className="wm-btn-export" onClick={handleExportCSV}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      {/* ── Stats Grid ── */}
      <section className="wm-stats">
        <div className="wm-stat-card deposits">
          <div className="wm-stat-icon deposits">
            <ArrowDownRight size={28} color="#fff" />
          </div>
          <div className="wm-stat-content">
            <span className="wm-stat-label">Total Deposits</span>
            <span className="wm-stat-val">
              {loadingStats ? '...' : formatCurrency(stats.totalDeposits)}
            </span>
          </div>
        </div>

        <div className="wm-stat-card accounts">
          <div className="wm-stat-icon accounts">
            <WalletIcon size={28} color="#fff" />
          </div>
          <div className="wm-stat-content">
            <span className="wm-stat-label">Virtual Accounts</span>
            <span className="wm-stat-val">
              {loadingStats ? '...' : stats.totalVirtualAccounts.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="wm-stat-card revenue">
          <div className="wm-stat-icon revenue">
            <ArrowUpRight size={28} color="#fff" />
          </div>
          <div className="wm-stat-content">
            <span className="wm-stat-label">Revenue (Unlocks)</span>
            <span className="wm-stat-val">
              {loadingStats ? '...' : formatCurrency(stats.totalUnlocks)}
            </span>
          </div>
        </div>
      </section>

      {/* ── Filter Controls Card ── */}
      <section className="wm-controls">
        <div className="wm-controls-row">
          <div className="wm-controls-left">
            <div className="wm-search-wrapper">
              <Search size={18} className="wm-search-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, ID, or reference..."
                className="wm-search-input"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="wm-select-filter"
            >
              <option value="All">All Types</option>
              <option value="Funding">Funding</option>
              <option value="Spending">Spending</option>
              <option value="Bonus">Bonus</option>
              <option value="Transfer">Transfer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="wm-select-filter"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="wm-controls-right">
            <span className="wm-pagination-info">
              {totalTxns > 0 ? `Total: ${totalTxns} records` : 'No records found'}
            </span>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(debouncedSearch || typeFilter !== 'All' || statusFilter !== 'All') && (
          <div className="wm-active-filters-row">
            <span className="wm-filter-pill-label">Active Filters:</span>
            {debouncedSearch && (
              <div className="wm-filter-pill">
                Search: {debouncedSearch}
                <button onClick={() => setSearch('')}><X size={13} /></button>
              </div>
            )}
            {typeFilter !== 'All' && (
              <div className="wm-filter-pill">
                Type: {typeFilter}
                <button onClick={() => setTypeFilter('All')}><X size={13} /></button>
              </div>
            )}
            {statusFilter !== 'All' && (
              <div className="wm-filter-pill">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('All')}><X size={13} /></button>
              </div>
            )}
            <button
              className="wm-clear-all-filters"
              onClick={() => {
                setSearch('');
                setTypeFilter('All');
                setStatusFilter('All');
                setPage(1);
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </section>

      {/* ── Table view Card ── */}
      <section className="wm-table-card">
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Student</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingTxns ? (
                Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                  <SkeletonRow key={idx} idx={idx} />
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-8">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id}>
                    <td>
                      <div className="wm-cell-id">
                        <span className="font-mono text-muted">
                          {txn._id.slice(-8).toUpperCase()}
                        </span>
                        <button
                          className={`wm-copy-btn ${copiedId === txn._id ? 'copied' : ''}`}
                          onClick={(e) => handleCopyId(e, txn._id)}
                          title="Copy Full ID"
                        >
                          {copiedId === txn._id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="wm-avatar-container">
                        <div className={`wm-avatar ${getAvatarClass(txn.user?.name || '')}`}>
                          {getInitials(txn.user?.name || '')}
                        </div>
                        <div>
                          <div className="font-semibold">{txn.user?.name || 'Unknown User'}</div>
                          <div className="text-xs text-muted">{txn.user?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`wm-badge type-${txn.type}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className={`font-semibold ${txn.type === 'funding' || txn.type === 'bonus' ? 'text-success' : 'text-danger'}`}>
                      {txn.type === 'funding' || txn.type === 'bonus' ? '+' : '-'} {formatCurrency(txn.amount)}
                    </td>
                    <td className="text-muted">{formatDate(txn.createdAt)}</td>
                    <td>
                      <span className={`wm-badge status-${txn.status}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="wm-btn-view-detail" onClick={() => setDrawer(txn)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Pagination Bar ── */}
        {!loadingTxns && totalPages > 1 && (
          <div className="wm-pagination">
            <span className="wm-pagination-info">
              Showing {Math.min(totalTxns, (page - 1) * PAGE_SIZE + 1)} to{' '}
              {Math.min(totalTxns, page * PAGE_SIZE)} of {totalTxns} records
            </span>
            <div className="wm-pagination-btns">
              <button
                className="wm-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="wm-page-indicator">
                {page} / {totalPages}
              </span>
              <button
                className="wm-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════
         SIDE DRAWER — DETAIL VIEW
         ══════════════════════════ */}
      {drawer && (
        <>
          <div className="wm-drawer-backdrop" onClick={() => setDrawer(null)} />
          <aside className="wm-drawer">
            <div className="wm-drawer-accent" />
            <div className="wm-drawer-header">
              <span className="wm-drawer-title">Transaction Receipt</span>
              <button className="wm-drawer-close" onClick={() => setDrawer(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="wm-drawer-body">
              <div className="wm-drawer-hero">
                <span className="wm-badge type-spending" style={{ textTransform: 'uppercase', fontSize: 11 }}>
                  {drawer.type}
                </span>
                <span className="wm-drawer-amount">
                  {drawer.type === 'funding' || drawer.type === 'bonus' ? '+' : '-'} {formatCurrency(drawer.amount)}
                </span>
                <div style={{ marginTop: 12 }}>
                  <span className={`wm-badge status-${drawer.status}`}>
                    {drawer.status}
                  </span>
                </div>
              </div>

              <div className="wm-drawer-section">
                <span className="wm-drawer-section-title">Student Information</span>
                <div className="wm-detail-row">
                  <span className="wm-detail-lbl">Name</span>
                  <span className="wm-detail-val">{drawer.user?.name || 'Unknown User'}</span>
                </div>
                <div className="wm-detail-row">
                  <span className="wm-detail-lbl">Email</span>
                  <span className="wm-detail-val">{drawer.user?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="wm-drawer-section">
                <span className="wm-drawer-section-title">Payment Details</span>
                <div className="wm-detail-row">
                  <span className="wm-detail-lbl">Description</span>
                  <span className="wm-detail-val">{drawer.description}</span>
                </div>
                <div className="wm-detail-row">
                  <span className="wm-detail-lbl">Date & Time</span>
                  <span className="wm-detail-val">{formatDate(drawer.createdAt)}</span>
                </div>
                <div className="wm-detail-row">
                  <span className="wm-detail-lbl">Reference ID</span>
                  <span className="wm-detail-val mono" style={{ fontSize: 13 }}>
                    {drawer.reference || 'N/A'}
                  </span>
                </div>
                <div className="wm-detail-row">
                  <span className="wm-detail-lbl">System ID</span>
                  <span className="wm-detail-val mono" style={{ fontSize: 12 }}>
                    {drawer._id}
                  </span>
                </div>
              </div>

              <div className="wm-drawer-section">
                <span className="wm-drawer-section-title">Audit Log</span>
                <div className="wm-detail-row">
                  <span className="wm-detail-lbl">Balance Before</span>
                  <span className="wm-detail-val">{formatCurrency(drawer.balanceBefore || 0)}</span>
                </div>
                <div className="wm-detail-row" style={{ color: '#4f46e5' }}>
                  <span className="wm-detail-lbl" style={{ color: '#4f46e5', fontWeight: 600 }}>Change</span>
                  <span className="wm-detail-val" style={{ color: '#4f46e5', fontWeight: 600 }}>
                    {drawer.type === 'funding' || drawer.type === 'bonus' ? '+' : '-'} {formatCurrency(drawer.amount)}
                  </span>
                </div>
                <div className="wm-detail-row">
                  <span className="wm-detail-lbl">Balance After</span>
                  <span className="wm-detail-val">{formatCurrency(drawer.balanceAfter || 0)}</span>
                </div>
              </div>
            </div>

            <div className="wm-drawer-footer">
              <button className="wm-drawer-btn-primary" onClick={() => setDrawer(null)}>
                Close Receipt
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ══════════════════════════
         CONFIGURE FEES MODAL
         ══════════════════════════ */}
      {feeModalOpen && (
        <div className="wm-modal-backdrop" onClick={() => setFeeModalOpen(false)}>
          <div className="wm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wm-modal-header">
              <span className="wm-modal-title">Configure Economy Fees</span>
              <button className="wm-drawer-close" onClick={() => setFeeModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveFees}>
              <div className="wm-modal-body">
                <div className="wm-form-group">
                  <label className="wm-form-lbl">Exam Unlock Fee</label>
                  <div className="wm-input-prefix-wrapper">
                    <span className="wm-input-prefix">₦</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeConfig.examUnlockFee}
                      onChange={(e) =>
                        setFeeConfig({ ...feeConfig, examUnlockFee: Number(e.target.value) })
                      }
                      className="wm-modal-input"
                    />
                  </div>
                </div>

                <div className="wm-form-group">
                  <label className="wm-form-lbl">Welcome Bonus</label>
                  <div className="wm-input-prefix-wrapper">
                    <span className="wm-input-prefix">₦</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeConfig.welcomeBonus}
                      onChange={(e) =>
                        setFeeConfig({ ...feeConfig, welcomeBonus: Number(e.target.value) })
                      }
                      className="wm-modal-input"
                    />
                  </div>
                </div>

                <div className="wm-form-group">
                  <label className="wm-form-lbl">Virtual Account Generation Cost</label>
                  <div className="wm-input-prefix-wrapper">
                    <span className="wm-input-prefix">₦</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeConfig.virtualAccountFee}
                      onChange={(e) =>
                        setFeeConfig({ ...feeConfig, virtualAccountFee: Number(e.target.value) })
                      }
                      className="wm-modal-input"
                    />
                  </div>
                </div>
              </div>

              <div className="wm-modal-footer">
                <button
                  type="button"
                  className="wm-btn-cancel"
                  onClick={() => setFeeModalOpen(false)}
                  disabled={savingFees}
                >
                  Cancel
                </button>
                <button type="submit" className="wm-btn-save" disabled={savingFees}>
                  {savingFees ? (
                    <>
                      <RefreshCw size={14} className="spinning" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={14} />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
