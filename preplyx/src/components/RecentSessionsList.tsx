"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export interface CompletedSession {
  id: string;
  exam: string;
  subject: string;
  score: number;
  total: number;
  pct: number;
  date: number;
  timeSpentSeconds?: number;
}

export default function RecentSessionsList() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CompletedSession[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    setMounted(true);
    if (token) {
      fetch('http://localhost:5000/api/data/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.error(err));
    }
  }, [token]);

  if (!mounted || !sessions) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        No recent sessions found on server. Start a practice exam to see your history!
      </div>
    );
  }

  const getGradeColor = (pct: number) => {
    if (pct >= 75) return { bg: '#dcfce7', text: '#16a34a' }; // Green
    if (pct >= 50) return { bg: '#fef3c7', text: '#d97706' }; // Yellow
    return { bg: '#fee2e2', text: '#dc2626' }; // Red
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeSpent = (seconds: number | undefined) => {
    if (seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {sessions.slice(0, 10).map((row, index) => {
        const grade = getGradeColor(row.pct);
        const wrongCount = row.total - row.score;
        
        return (
          <div 
            key={row.id || index}
            onClick={() => router.push(`/dashboard/result?id=${row.id}`)}
            className="recent-session-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderRadius: '16px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', textTransform: 'capitalize', marginBottom: '6px', letterSpacing: '-0.3px' }}>
                {row.exam} {row.subject}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <span>{formatDate(row.date)}</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--glass-border)' }} />
                <span>{formatTimeSpent(row.timeSpentSeconds)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: 700 }}>Correct</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>{row.score} <span style={{ fontSize: '12px', color: '#86efac', fontWeight: 600 }}>/{row.total}</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: 700 }}>Wrong</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626' }}>{wrongCount}</div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '68px', padding: '10px 14px', borderRadius: '12px', 
                backgroundColor: grade.bg, color: grade.text,
                fontSize: '16px', fontWeight: 900 
              }}>
                {row.pct}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
