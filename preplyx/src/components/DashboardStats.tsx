"use client";

import { useEffect, useState } from 'react';
import { Target, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface OverallStats {
  questionsAnswered: number;
  averageAccuracy: number;
  studyTimeSeconds: number;
  currentStreak: number;
  monthlyStreak: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [mounted, setMounted] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    setMounted(true);
    if (token) {
      fetch('http://localhost:5000/api/data/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
    }
  }, [token]);

  if (!mounted || !stats) {
    return <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', opacity: 0.5 }}>Loading stats...</div>;
  }

  const formatTime = (seconds: number) => {
    if (seconds === 0) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const statItems = [
    { label: 'Questions Answered', value: stats.questionsAnswered.toString(), icon: <Target size={18} color="#4B0FA3" /> },
    { label: 'Average Accuracy', value: `${stats.averageAccuracy}%`, icon: <CheckCircle2 size={18} color="#16a34a" /> },
    { label: 'Study Time', value: formatTime(stats.studyTimeSeconds), icon: <Clock size={18} color="#D97706" /> },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
      {statItems.map(stat => (
        <div key={stat.label} style={{
          flex: '1 1 200px', borderRadius: '10px', padding: '16px 18px',
          backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--color-bg-main)' }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
