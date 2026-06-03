"use client";

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getOverallStats, trackDailyActivity, OverallStats } from '@/lib/storage';

export default function StreakWidget() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadStats = () => {
    setStats(getOverallStats());
  };

  useEffect(() => {
    setMounted(true);
    loadStats();
  }, []);

  const handleTrackStreak = () => {
    trackDailyActivity();
    loadStats(); // Refresh streak counter
  };

  if (!mounted || !stats) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: '8px',
        backgroundColor: '#fff', border: '1px solid var(--glass-border)',
        opacity: 0.5
      }}>
        <Flame size={14} style={{ color: '#ef4444' }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>Loading...</span>
      </div>
    );
  }

  return (
    <button 
      onClick={handleTrackStreak}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: '8px',
        backgroundColor: '#fff', border: '1px solid var(--glass-border)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)', cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      className="streak-nav-btn"
      title="Click to track today's activity!"
    >
      <Flame size={16} style={{ color: '#ef4444' }} />
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>
        {stats.currentStreak} Day{stats.currentStreak !== 1 ? 's' : ''} Streak
      </span>
    </button>
  );
}
