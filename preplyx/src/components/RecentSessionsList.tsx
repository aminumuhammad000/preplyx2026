"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCompletedSessions, CompletedSession } from '@/lib/storage';

export default function RecentSessionsList() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSessions(getCompletedSessions());
  }, []);

  if (!mounted) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        No recent sessions found. Start a practice exam to see your history!
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
    <div style={{ borderRadius: '12px', backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: 'var(--color-bg-main)', borderBottom: '1px solid var(--glass-border)' }}>
          <tr>
            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Exam Session</th>
            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Spent</th>
            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Correct</th>
            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Wrong</th>
            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {sessions.slice(0, 10).map((row, i) => {
            const grade = getGradeColor(row.pct);
            const wrongCount = row.total - row.score;
            
            return (
              <tr 
                key={row.id} 
                onClick={() => router.push(`/dashboard/result?id=${row.id}`)}
                className="recent-session-link"
                style={{
                  borderBottom: i < Math.min(sessions.length, 10) - 1 ? '1px solid var(--glass-border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', textTransform: 'capitalize' }}>
                    {row.exam} {row.subject}
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {formatDate(row.date)}
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {formatTimeSpent(row.timeSpentSeconds)}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{row.score}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '2px' }}>/{row.total}</span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>{wrongCount}</span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    backgroundColor: grade.bg, 
                    color: grade.text,
                    fontSize: '12px', 
                    fontWeight: 800 
                  }}>
                    {row.pct}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
