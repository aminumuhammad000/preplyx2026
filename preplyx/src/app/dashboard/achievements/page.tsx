"use client";
import { Award, Trophy, Star, Lock, TrendingUp, Target, Zap, Flame, Crown, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Achievements() {
  const [isMobile, setIsMobile] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState({
    totalAchievements: 0,
    unlocked: 0,
    points: 0,
    level: 1
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await api.getAchievements(token);
        setAchievements(data.achievements);
        setUserProgress(data.progress);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [token]);

  const unlockedAchievements = (achievements || []).filter((a) => a.unlocked);
  const lockedAchievements = (achievements || []).filter((a) => !a.unlocked);

  // Icon mapping
  const iconMap: any = {
    Star, Zap, Flame, Crown, Target, Trophy, Medal, Award, TrendingUp, Lock
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Trophy size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: '#94a3b8' }}>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '20px' : '28px' }}>
        <h1 style={{ fontSize: isMobile ? '22px' : '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
          Achievements
        </h1>
        <p style={{ fontSize: isMobile ? '13px' : '14px', color: 'var(--color-text-muted)' }}>
          Track your badges and unlock new achievements
        </p>
      </div>

      {/* Progress Overview */}
      <div style={{
        background: 'var(--gradient-primary)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(123, 47, 247, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', backdropFilter: 'blur(10px)' }}>
              Current Rank
            </div>
            <h3 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1px', lineHeight: 1 }}>
              Level {userProgress.level} Master
            </h3>
            <p style={{ fontSize: '15px', opacity: 0.9, maxWidth: '400px', lineHeight: 1.5 }}>
              You're doing great! You have unlocked {userProgress.unlocked} out of {userProgress.totalAchievements} available achievements. Keep going to reach the next tier!
            </p>
          </div>
          <div style={{ textAlign: 'right', flex: '1 1 150px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>{userProgress.points}</span>
              <span style={{ fontSize: '16px', fontWeight: 700, opacity: 0.8 }}>XP</span>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, opacity: 0.8, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Points Earned</p>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
            <span>Progress to Next Level</span>
            <span>{Math.round((userProgress.unlocked / userProgress.totalAchievements) * 100)}%</span>
          </div>
          <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ 
              width: `${(userProgress.unlocked / userProgress.totalAchievements) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #fff, #f3e8ff)', 
              borderRadius: '6px', 
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)'
            }} />
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '12px' : '16px' }}>
          <Trophy size={isMobile ? 18 : 20} color="#7B2FF7" />
          <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Unlocked Achievements
          </h3>
          <span style={{ fontSize: isMobile ? '11px' : '12px', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            {unlockedAchievements.length} unlocked
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: isMobile ? '12px' : '16px' }}>
          {unlockedAchievements.map((achievement) => {
            const IconComponent = iconMap[achievement.icon] || Star;
            return (
              <div
                key={achievement.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: isMobile ? '10px' : '12px',
                  padding: isMobile ? '16px' : '20px',
                  boxShadow: 'var(--shadow-soft)',
                  border: '1px solid var(--glass-border)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: isMobile ? '48px' : '56px',
                  height: isMobile ? '48px' : '56px',
                  borderRadius: isMobile ? '10px' : '12px',
                  backgroundColor: `${achievement.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto ' + (isMobile ? '10px' : '12px')
                }}>
                  <IconComponent size={isMobile ? 24 : 28} color={achievement.color} />
                </div>
                <h4 style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                  {achievement.name}
                </h4>
                <p style={{ fontSize: isMobile ? '11px' : '12px', color: 'var(--color-text-muted)', marginBottom: isMobile ? '6px' : '8px', minHeight: isMobile ? '28px' : '32px' }}>
                  {achievement.description}
                </p>
                <p style={{ fontSize: isMobile ? '10px' : '11px', color: '#10b981', fontWeight: 600 }}>
                  Unlocked {achievement.date}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Locked Achievements */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '12px' : '16px' }}>
          <Lock size={isMobile ? 18 : 20} color="#94a3b8" />
          <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Locked Achievements
          </h3>
          <span style={{ fontSize: isMobile ? '11px' : '12px', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            {lockedAchievements.length} locked
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: isMobile ? '12px' : '16px' }}>
          {lockedAchievements.map((achievement) => {
            const IconComponent = iconMap[achievement.icon] || Lock;
            return (
              <div
                key={achievement.id}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: isMobile ? '10px' : '12px',
                  padding: isMobile ? '16px' : '20px',
                  border: '1px solid var(--glass-border)',
                  textAlign: 'center',
                  opacity: 0.7,
                  position: 'relative'
                }}
              >
                <div style={{
                  width: isMobile ? '48px' : '56px',
                  height: isMobile ? '48px' : '56px',
                  borderRadius: isMobile ? '10px' : '12px',
                  backgroundColor: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto ' + (isMobile ? '10px' : '12px')
                }}>
                  <IconComponent size={isMobile ? 24 : 28} color="#94a3b8" />
                </div>
                <h4 style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                  {achievement.name}
                </h4>
                <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#94a3b8', marginBottom: isMobile ? '10px' : '12px', minHeight: isMobile ? '28px' : '32px' }}>
                  {achievement.description}
                </p>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${achievement.progress || 0}%`, height: '100%', backgroundColor: '#94a3b8', borderRadius: '3px' }} />
                </div>
                <p style={{ fontSize: isMobile ? '10px' : '11px', color: '#94a3b8', marginTop: '6px' }}>
                  {achievement.progress || 0}% complete
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Tips */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: isMobile ? '14px' : '16px',
        padding: isMobile ? '20px' : '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)',
        marginTop: isMobile ? '20px' : '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isMobile ? '12px' : '16px' }}>
          <TrendingUp size={isMobile ? 20 : 24} color="#7B2FF7" />
          <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            How to Unlock More
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: isMobile ? '10px' : '16px' }}>
          {[
            { tip: 'Complete daily practice exams', icon: Target },
            { tip: 'Maintain your study streak', icon: Flame },
            { tip: 'Score high on mock exams', icon: Trophy },
            { tip: 'Try different exam types', icon: Award },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '12px', padding: isMobile ? '10px' : '12px', borderRadius: isMobile ? '6px' : '8px', backgroundColor: '#f8fafc' }}>
              <item.icon size={isMobile ? 16 : 18} color="#7B2FF7" />
              <span style={{ fontSize: isMobile ? '12px' : '13px', color: 'var(--color-text-main)' }}>{item.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
