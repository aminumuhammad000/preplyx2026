"use client";

import { useState, useEffect } from 'react';
import { Target, Trophy, TrendingUp, BarChart3, AlertTriangle, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const performanceData = [
  { name: 'Week 1', score: 45 },
  { name: 'Week 2', score: 52 },
  { name: 'Week 3', score: 48 },
  { name: 'Week 4', score: 61 },
  { name: 'Week 5', score: 68 },
  { name: 'Week 6', score: 76 },
  { name: 'Week 7', score: 85 },
];

const subjectData = [
  { subject: 'Mathematics', mastery: 85, fill: '#4B0FA3' },
  { subject: 'English', mastery: 62, fill: '#7B2FF7' },
  { subject: 'Physics', mastery: 40, fill: '#ef4444' },
  { subject: 'Chemistry', mastery: 70, fill: '#10b981' },
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading analytics dashboard...</div>;
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
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-text-main)', lineHeight: 1, marginBottom: '6px' }}>342</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Questions Answered</div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(123,47,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={28} color="var(--color-accent)" />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-text-main)', lineHeight: 1, marginBottom: '6px' }}>76%</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Accuracy</div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div style={{ background: 'var(--gradient-primary)', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 30px rgba(75,15,163,0.15)', display: 'flex', alignItems: 'center', gap: '20px', color: '#fff' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trophy size={28} color="#F5B700" />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1, marginBottom: '6px' }}>Gold</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current League</div>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', marginBottom: '32px' }}>
        
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--color-text-main)' }} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 600 }}
                />
                <Bar dataKey="mastery" radius={[0, 8, 8, 0]} barSize={20}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recommendations Row */}
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '16px' }}>AI Study Recommendations</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
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
