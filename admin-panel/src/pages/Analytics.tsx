import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Users,
  Wallet,
  MonitorPlay,
  TrendingUp,
  RefreshCw,
  Loader
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell
} from 'recharts';
import './Analytics.css';

const API_BASE_URL = 'http://localhost:5000/api';

/* ── Types ── */
interface AnalyticsMetrics {
  totalUsers: number;
  totalRevenue: number;
  totalSessions: number;
  averageScore: number;
}

interface TrendData {
  date: string;
  revenue: number;
  users: number;
}

interface ExamDistribution {
  name: string;
  value: number;
}

interface AnalyticsData {
  metrics: AnalyticsMetrics;
  trends: TrendData[];
  examDistribution: ExamDistribution[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#d946ef', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="custom-tooltip-date">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="custom-tooltip-item" style={{ color: entry.color }}>
            <span>{entry.name}</span>
            <span>
              {entry.name === 'Revenue' ? '₦' : ''}
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader size={40} className="um-spin" style={{ color: '#4f46e5' }} />
      </div>
    );
  }

  const formatCurrency = (num: number) => {
    return '₦' + num.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  };

  return (
    <div className="analytics-page">
      {/* ───── HERO HEADER ───── */}
      <div className="analytics-hero">
        <div className="analytics-hero-left">
          <div className="analytics-hero-eyebrow">
            <BarChart3 size={12} />
            Platform Insights
          </div>
          <h1>Analytics Dashboard</h1>
          <p className="analytics-hero-sub">
            Monitor revenue, user growth, and exam performance over the last 30 days.
          </p>
        </div>
        <div className="analytics-hero-right">
          <button 
            className="um-btn-refresh" 
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: '10px', padding: '0 20px', height: '44px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => fetchAnalytics(true)} 
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'um-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* ───── METRIC CARDS ───── */}
      {data && (
        <>
          <div className="analytics-metrics">
            <div className="metric-card">
              <div className="metric-icon revenue"><Wallet size={24} /></div>
              <div className="metric-info">
                <div className="metric-title">Total Revenue</div>
                <div className="metric-value">{formatCurrency(data.metrics.totalRevenue)}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon users"><Users size={24} /></div>
              <div className="metric-info">
                <div className="metric-title">Total Users</div>
                <div className="metric-value">{data.metrics.totalUsers.toLocaleString()}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon sessions"><MonitorPlay size={24} /></div>
              <div className="metric-info">
                <div className="metric-title">Exam Sessions</div>
                <div className="metric-value">{data.metrics.totalSessions.toLocaleString()}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon score"><TrendingUp size={24} /></div>
              <div className="metric-info">
                <div className="metric-title">Avg Score</div>
                <div className="metric-value">{data.metrics.averageScore.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* ───── CHARTS GRID ───── */}
          <div className="analytics-grid">
            
            {/* Revenue & Users Trend */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Growth & Revenue (30 Days)</h3>
                <p className="chart-subtitle">Daily breakdown of new user signups and funding deposits</p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(val) => '₦' + (val >= 1000 ? (val/1000)+'k' : val)}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="users" 
                      name="Signups" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      fillOpacity={0} 
                      fill="none" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Exam Distribution */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Top Exam Types</h3>
                <p className="chart-subtitle">Most popular exams taken by volume</p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.examDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.examDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
