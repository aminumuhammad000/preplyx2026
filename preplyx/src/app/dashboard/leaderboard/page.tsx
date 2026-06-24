"use client";
import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const [data, rank] = await Promise.all([
          api.getLeaderboard(token, timeFilter),
          api.getUserRank(token)
        ]);
        setLeaderboardData(data);
        setUserRank(rank);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token, timeFilter]);

  const badges = [
    { name: 'Top Performer', icon: Crown, color: '#f59e0b', description: 'Rank #1 this week' },
    { name: 'Streak Master', icon: Trophy, color: '#7B2FF7', description: '10+ day streak' },
    { name: 'Exam Champion', icon: Medal, color: '#10b981', description: '50+ exams completed' },
    { name: 'Rising Star', icon: TrendingUp, color: '#3b82f6', description: 'Fastest climber' },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} color="#f59e0b" />;
    if (rank === 2) return <Medal size={20} color="#c0c0c0" />;
    if (rank === 3) return <Medal size={20} color="#cd7f32" />;
    return <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' };
    if (rank === 2) return { background: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', color: '#fff' };
    if (rank === 3) return { background: 'linear-gradient(135deg, #cd7f32, #a0522d)', color: '#fff' };
    return { background: '#f8fafc', color: '#64748b' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={20} color="#fff" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Loading Leaderboard...</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Fetching latest rankings</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={20} color="#dc2626" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Error Loading Leaderboard</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
          Leaderboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          See how you rank among other students
        </p>
      </div>

      {/* Time Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['daily', 'weekly', 'monthly'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: timeFilter === filter ? 'var(--gradient-primary)' : '#fff',
              color: timeFilter === filter ? '#fff' : 'var(--color-text-main)',
              fontSize: '13px',
              fontWeight: 600,
              border: timeFilter === filter ? 'none' : '1px solid var(--glass-border)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Calendar size={16} />
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* User Rank Display */}
      {userRank && userRank.rank && (
        <div style={{
          background: 'linear-gradient(135deg, #4B0FA3, #7B2FF7)',
          borderRadius: '16px',
          padding: '20px',
          color: '#fff',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(75, 15, 163, 0.2)'
        }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Your Current Rank</div>
            <div style={{ fontSize: '32px', fontWeight: 900 }}>{userRank.rank}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{userRank.points.toLocaleString()} pts</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{userRank.exams} exams completed</div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {(leaderboardData || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', marginBottom: '32px', padding: '24px' }}>
          {/* 2nd Place */}
          {leaderboardData[1] && (
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 700,
                color: '#fff',
                margin: '0 auto 12px',
                boxShadow: '0 4px 12px rgba(192, 192, 192, 0.3)'
              }}>
                {leaderboardData[1].avatar}
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                {leaderboardData[1].name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                {leaderboardData[1].points.toLocaleString()} pts
              </p>
              <div style={{
                height: '120px',
                background: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '12px'
              }}>
                <Medal size={32} color="#fff" />
              </div>
            </div>
          )}

          {/* 1st Place */}
          {leaderboardData[0] && (
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 700,
                color: '#fff',
                margin: '0 auto 12px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)'
              }}>
                {leaderboardData[0].avatar}
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                {leaderboardData[0].name}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                {leaderboardData[0].points.toLocaleString()} pts
              </p>
              <div style={{
                height: '160px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '12px'
              }}>
                <Crown size={40} color="#fff" />
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {leaderboardData[2] && (
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #cd7f32, #a0522d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 700,
                color: '#fff',
                margin: '0 auto 12px',
                boxShadow: '0 4px 12px rgba(205, 127, 50, 0.3)'
              }}>
                {leaderboardData[2].avatar}
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                {leaderboardData[2].name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                {leaderboardData[2].points.toLocaleString()} pts
              </p>
              <div style={{
                height: '100px',
                background: 'linear-gradient(135deg, #cd7f32, #a0522d)',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '12px'
              }}>
                <Medal size={32} color="#fff" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '20px' }}>
          Full Rankings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(leaderboardData || []).map((student) => (
            <div
              key={student.rank}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...getRankStyle(student.rank)
              }}>
                {getRankIcon(student.rank)}
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff'
              }}>
                {student.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '2px' }}>
                  {student.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {student.exams} exams · {student.streak} day streak
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#7B2FF7' }}>
                  {student.points.toLocaleString()}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Section */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '20px' }}>
          Achievement Badges
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '16px' }}>
          {badges.map((badge) => (
            <div
              key={badge.name}
              style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--glass-border)',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: `${badge.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <badge.icon size={24} color={badge.color} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                {badge.name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
