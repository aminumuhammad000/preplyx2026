"use client";

import { useState, useEffect } from 'react';
import { Target, Trophy, TrendingUp, BarChart3, AlertTriangle, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [subjectMastery, setSubjectMastery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const performanceData = (analytics?.activeDates && Array.isArray(analytics.activeDates) 
    ? analytics.activeDates.slice(-7).map((date: string, index: number) => ({
        name: `Week ${index + 1}`,
        score: Math.round(Math.random() * 40 + 40), // Placeholder until we have per-week data
      })) 
    : []);

  const subjectData = subjectMastery.length > 0 ? subjectMastery.map((subject: any) => ({
    subject: subject.subject,
    mastery: subject.mastery,
    fill: subject.mastery >= 70 ? '#10b981' : subject.mastery >= 50 ? '#7B2FF7' : '#ef4444'
  })) : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const [statsData, analyticsData, subjectMasteryData] = await Promise.all([
          api.getStats(token),
          api.getSessionAnalytics(token),
          api.getSubjectMastery(token)
        ]);
        setStats(statsData);
        setAnalytics(analyticsData);
        setSubjectMastery(subjectMasteryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (!mounted) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading analytics dashboard...</div>;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart3 size={20} color="#fff" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Loading Analytics...</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Fetching your performance data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={20} color="#dc2626" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Error Loading Analytics</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-text-main)', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Performance Analytics
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Track your progress, identify weak points, and optimize your study plan.
        </p>
      </div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Stat Card 1 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(75,15,163,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={28} color="var(--color-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-text-main)', lineHeight: 1, marginBottom: '6px' }}>{stats?.questionsAnswered || 0}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Questions Answered</div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(123,47,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={28} color="var(--color-accent)" />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-text-main)', lineHeight: 1, marginBottom: '6px' }}>{Math.round(stats?.averageAccuracy || 0)}%</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Accuracy</div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div style={{ background: 'var(--gradient-primary)', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 30px rgba(75,15,163,0.15)', display: 'flex', alignItems: 'center', gap: '20px', color: '#fff' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trophy size={28} color="#F5B700" />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1, marginBottom: '6px' }}>{analytics?.totalSessions || 0}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sessions</div>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left: Area Chart (Performance Trend) */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>Score Trend Over Time</h3>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', backgroundColor: 'rgba(123,47,247,0.1)', padding: '6px 14px', borderRadius: '20px' }}>Last 7 Weeks</div>
          </div>
          
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 600 }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--color-accent)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Bar Chart (Subject Mastery) */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>Subject Mastery</h3>
            <BarChart3 size={18} color="var(--color-text-muted)" />
          </div>
          
          <div style={{ height: '300px', width: '100%' }}>
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--color-text-main)' }} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 600 }}
                  />
                  <Bar dataKey="mastery" radius={[0, 8, 8, 0]} barSize={20}>
                    {(subjectData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px' }}>
                <BookOpen size={32} color="#e2e8f0" />
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>No subject data yet</p>
                <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Complete some exams to see your subject mastery</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recommendations Row */}
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '16px' }}>AI Study Recommendations</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        
        {/* Recommendation: Focus Area */}
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '24px', display: 'flex', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>Focus Area: Physics</h4>
            <p style={{ fontSize: '13px', color: '#b91c1c', lineHeight: 1.6 }}>
              Your accuracy in Physics is currently below 50%. Based on your recent tests, we strongly recommend practicing <strong>Kinematics</strong> and <strong>Dynamics</strong>. Try dedicating your next two study sessions exclusively to Physics.
            </p>
          </div>
        </div>

        {/* Recommendation: Strong Area */}
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '24px', display: 'flex', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={24} color="#16a34a" />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>Strong Subject: Mathematics</h4>
            <p style={{ fontSize: '13px', color: '#15803d', lineHeight: 1.6 }}>
              You are doing exceptionally well in Mathematics with an 85% mastery rate! Keep up the incredible momentum. To reach the 90%+ tier, focus specifically on advanced <strong>Calculus</strong> questions.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
