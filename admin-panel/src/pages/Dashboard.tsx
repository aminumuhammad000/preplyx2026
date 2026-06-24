import React, { useState, useEffect } from 'react';
import { Users, FileQuestion, BookOpen, Wallet, DollarSign, Activity, Award } from 'lucide-react';
import './Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

interface DashboardStats {
  totalStudents: number;
  activeToday: number;
  totalQuestions: number;
  totalSubjects: number;
  totalRevenue: number;
  depositsToday: number;
  totalUnlocks: number;
  totalSessions: number;
  totalExams: number;
  recentTransactions: any[];
}

const formatCurrency = (amount: number) => {
  if (amount >= 1_000_000) return `₦ ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦ ${(amount / 1_000).toFixed(1)}K`;
  return `₦ ${amount.toLocaleString()}`;
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/dashboard`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const val = (v: number | undefined) =>
    loading ? '...' : (v ?? 0).toLocaleString();

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p className="text-muted">Welcome back, Super Admin. Here is your platform overview.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon bg-primary"><Users size={28} color="white" /></div>
          <div className="kpi-content">
            <h3>Total Students</h3>
            <p className="kpi-value">{val(stats?.totalStudents)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-success"><Activity size={28} color="white" /></div>
          <div className="kpi-content">
            <h3>Active Students Today</h3>
            <p className="kpi-value">{val(stats?.activeToday)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-warning"><FileQuestion size={28} color="white" /></div>
          <div className="kpi-content">
            <h3>Total Questions</h3>
            <p className="kpi-value">{val(stats?.totalQuestions)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-info"><BookOpen size={28} color="white" /></div>
          <div className="kpi-content">
            <h3>Total Subjects</h3>
            <p className="kpi-value">{val(stats?.totalSubjects)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-success"><DollarSign size={28} color="white" /></div>
          <div className="kpi-content">
            <h3>Total Revenue</h3>
            <p className="kpi-value">{loading ? '...' : formatCurrency(stats?.totalRevenue ?? 0)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-primary"><Wallet size={28} color="white" /></div>
          <div className="kpi-content">
            <h3>Deposits Today</h3>
            <p className="kpi-value">{loading ? '...' : formatCurrency(stats?.depositsToday ?? 0)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-danger"><FileQuestion size={28} color="white" /></div>
          <div className="kpi-content">
            <h3>Results Unlocked</h3>
            <p className="kpi-value">{val(stats?.totalUnlocks)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-primary"><Award size={28} color="white" /></div>
          <div className="kpi-content">
            <h3>Exam Sessions</h3>
            <p className="kpi-value">{val(stats?.totalSessions)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts mt-6">
        <div className="card chart-card">
          <h3>Platform Summary</h3>
          <div className="chart-wrapper mt-4">
            {loading || !stats ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: 'var(--text-muted)' }}>
                Loading chart data…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Students', value: stats.totalStudents },
                    { name: 'Questions', value: stats.totalQuestions },
                    { name: 'Sessions', value: stats.totalSessions },
                    { name: 'Unlocks', value: stats.totalUnlocks },
                    { name: 'Exams', value: stats.totalExams },
                    { name: 'Subjects', value: stats.totalSubjects },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card list-card">
          <div className="flex justify-between items-center mb-4">
            <h3>Recent Transactions</h3>
            <button className="btn btn-outline" onClick={() => navigate('/wallet')}>View All</button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                      Loading transactions…
                    </td>
                  </tr>
                ) : !stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  stats.recentTransactions.map((txn: any) => (
                    <tr key={txn._id}>
                      <td>{txn.user?.name || 'Unknown'}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {txn.type === 'funding' ? 'Wallet Deposit' : txn.description || 'Exam Unlock'}
                      </td>
                      <td className={`font-semibold ${txn.type === 'funding' ? 'text-success' : 'text-danger'}`}>
                        {txn.type === 'funding' ? '+' : '-'} ₦ {txn.amount?.toLocaleString() ?? 0}
                      </td>
                      <td>
                        <span className={`badge ${
                          txn.status === 'completed' ? 'badge-success' :
                          txn.status === 'pending' ? 'badge-warning' : 'badge-danger'
                        }`} style={{ textTransform: 'capitalize' }}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
