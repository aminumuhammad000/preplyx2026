import React, { useState, useEffect, useCallback } from 'react';
import {
  MonitorPlay,
  Users,
  Target,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import './Simulation.css';

/* ── Config ── */
const API_BASE_URL = 'http://localhost:5000/api';

/* ── Types ── */
interface User {
  _id: string;
  name: string;
  email: string;
}

interface ExamSession {
  _id: string;
  user: User;
  exam: string;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  createdAt: string;
}

interface Stats {
  totalSessions: number;
  avgScore: number;
  avgTime: number;
  passRate: number;
}

export const Simulation: React.FC = () => {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterExam, setFilterExam] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');

  const availableExams = ['All', 'JAMB', 'WAEC', 'NECO', 'POST-UTME'];
  const availableSubjects = ['All', 'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology'];

  /* ── Fetch ── */
  const fetchSimulations = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: '10',
        exam: filterExam,
        subject: filterSubject,
      });
      const res = await fetch(`${API_BASE_URL}/admin/simulations?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
        setStats(data.stats);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.total || 0);
      }
    } catch (e) {
      console.error('Failed to load simulations:', e);
    } finally {
      setLoading(false);
    }
  }, [page, filterExam, filterSubject]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  /* ── Formatters ── */
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="sim-page">

      {/* ───── HERO ───── */}
      <div className="sim-hero">
        <div className="sim-hero-left">
          <div className="sim-hero-eyebrow">
            <MonitorPlay size={12} /> Live Engine
          </div>
          <h1>Simulation Management</h1>
          <p className="sim-hero-sub">
            Monitor real-time CBT sessions, analyze student performance, and review historical exam attempts across all subjects.
          </p>
        </div>
        <div className="sim-hero-right">
          <button className="sim-btn-secondary" onClick={fetchSimulations}>
            Refresh Data
          </button>
        </div>
      </div>

      {/* ───── STATS ───── */}
      <div className="sim-stats">
        <div className="sim-stat-card s-blue">
          <div className="sim-stat-icon s-blue"><Users size={24} color="#fff" /></div>
          <div>
            <div className="sim-stat-label">Total Sessions</div>
            <div className="sim-stat-value">{loading ? '—' : stats?.totalSessions.toLocaleString() || 0}</div>
          </div>
        </div>
        <div className="sim-stat-card s-green">
          <div className="sim-stat-icon s-green"><Target size={24} color="#fff" /></div>
          <div>
            <div className="sim-stat-label">Average Score</div>
            <div className="sim-stat-value">
              {loading ? '—' : stats?.avgScore || 0}
              <span className="sim-stat-suffix">%</span>
            </div>
          </div>
        </div>
        <div className="sim-stat-card s-orange">
          <div className="sim-stat-icon s-orange"><Clock size={24} color="#fff" /></div>
          <div>
            <div className="sim-stat-label">Avg Time Spent</div>
            <div className="sim-stat-value" style={{fontSize: '22px'}}>
              {loading ? '—' : formatTime(stats?.avgTime || 0)}
            </div>
          </div>
        </div>
        <div className="sim-stat-card s-purple">
          <div className="sim-stat-icon s-purple"><Award size={24} color="#fff" /></div>
          <div>
            <div className="sim-stat-label">Pass Rate</div>
            <div className="sim-stat-value">
              {loading ? '—' : stats?.passRate || 0}
              <span className="sim-stat-suffix">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───── TOOLBAR ───── */}
      <div className="sim-toolbar">
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Exam Attempts</h2>
        <div className="sim-filters">
          <div className="sim-select-wrap">
            <GraduationCap size={15} color="#64748b" />
            <select value={filterExam} onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}>
              {availableExams.map(ex => <option key={ex} value={ex}>{ex === 'All' ? 'All Exams' : ex}</option>)}
            </select>
          </div>
          <div className="sim-select-wrap">
            <BookOpen size={15} color="#64748b" />
            <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setPage(1); }}>
              {availableSubjects.map(sub => <option key={sub} value={sub}>{sub === 'All' ? 'All Subjects' : sub}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ───── TABLE ───── */}
      <div className="sim-table-card">
        <div className="sim-table-wrap">
          <table className="sim-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Exam & Subject</th>
                <th>Score</th>
                <th>Time Spent</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{textAlign: 'right'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="sim-skeleton-row"></td></tr>
                ))
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="sim-empty">
                      <div className="sim-empty-icon"><MonitorPlay size={32} /></div>
                      <h3>No sessions found</h3>
                      <p>There are no completed simulation sessions matching your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.map(s => {
                  const passed = s.percentage >= 50;
                  return (
                    <tr key={s._id}>
                      <td>
                        <div className="sim-user-cell">
                          <div className="sim-user-avatar">
                            {s.user?.name ? s.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="sim-user-info">
                            <span className="sim-user-name">{s.user?.name || 'Unknown User'}</span>
                            <span className="sim-user-email">{s.user?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{display: 'flex', gap: '6px'}}>
                          <span className="sim-tag sim-tag-exam">{s.exam}</span>
                          <span className="sim-tag sim-tag-subject">{s.subject}</span>
                        </div>
                      </td>
                      <td>
                        <div className="sim-score-cell">
                          {s.score} <span className="sim-score-total">/ {s.total}</span>
                        </div>
                      </td>
                      <td>{formatTime(s.timeSpentSeconds)}</td>
                      <td>
                        <span className={`sim-status ${passed ? 'pass' : 'fail'}`}>
                          {passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td>
                        <div style={{color: '#475569', fontSize: '13px'}}>{formatDate(s.createdAt)}</div>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <button className="sim-action-btn">View Details</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ───── PAGINATION ───── */}
        {!loading && totalPages > 1 && (
          <div className="sim-pagination">
            <div className="sim-page-info">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalRecords)} of {totalRecords} sessions
            </div>
            <div className="sim-page-controls">
              <button className="sim-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <button className="sim-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
