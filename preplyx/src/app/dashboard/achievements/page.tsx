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
          <Trophy size={48} color="var(--color-background)" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: 'var(--color-neutral)' }}>Loading achievements...</p>
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
        borderRadius: '16px',
        padding: '16px 24px',
        marginBottom: '24px',
        color: 'var(--color-background)',
        boxShadow: '0 4px 16px rgba(123, 47, 247, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', backdropFilter: 'blur(10px)' }}>
                Current Rank
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1, margin: 0 }}>
                Level {userProgress.level} Master
              </h3>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.9, maxWidth: '400px', lineHeight: 1.4, margin: 0 }}>
              You have unlocked {userProgress.unlocked} out of {userProgress.totalAchievements} achievements. Keep going!
            </p>
          </div>
          <div style={{ textAlign: 'right', flex: '1 1 150px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>{userProgress.points}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>XP</span>
            </div>
            <p style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Points</p>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>
            <span>Progress to Next Level</span>
            <span>{Math.round((userProgress.unlocked / userProgress.totalAchievements) * 100)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ 
              width: `${(userProgress.unlocked / userProgress.totalAchievements) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--color-background), var(--color-primary))', 
              borderRadius: '4px', 
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)'
            }} />
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '12px' : '16px' }}>
          <Trophy size={isMobile ? 18 : 20} color="var(--color-primary)" />
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
                  backgroundColor: 'var(--color-background)',
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
                <p style={{ fontSize: isMobile ? '10px' : '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
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
          <Lock size={isMobile ? 18 : 20} color="var(--color-neutral)" />
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
                  backgroundColor: 'var(--color-background)',
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
                  backgroundColor: 'var(--color-background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto ' + (isMobile ? '10px' : '12px')
                }}>
                  <IconComponent size={isMobile ? 24 : 28} color="var(--color-neutral)" />
                </div>
                <h4 style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 700, color: 'var(--color-neutral)', marginBottom: '4px' }}>
                  {achievement.name}
                </h4>
                <p style={{ fontSize: isMobile ? '11px' : '12px', color: 'var(--color-neutral)', marginBottom: isMobile ? '10px' : '12px', minHeight: isMobile ? '28px' : '32px' }}>
                  {achievement.description}
                </p>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-background)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${achievement.progress || 0}%`, height: '100%', backgroundColor: 'var(--color-neutral)', borderRadius: '3px' }} />
                </div>
                <p style={{ fontSize: isMobile ? '10px' : '11px', color: 'var(--color-neutral)', marginTop: '6px' }}>
                  {achievement.progress || 0}% complete
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Tips */}
      <div style={{
        backgroundColor: 'var(--color-background)',
        borderRadius: isMobile ? '14px' : '16px',
        padding: isMobile ? '20px' : '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)',
        marginTop: isMobile ? '20px' : '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isMobile ? '12px' : '16px' }}>
          <TrendingUp size={isMobile ? 20 : 24} color="var(--color-primary)" />
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
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '12px', padding: isMobile ? '10px' : '12px', borderRadius: isMobile ? '6px' : '8px', backgroundColor: 'var(--color-background)' }}>
              <item.icon size={isMobile ? 16 : 18} color="var(--color-primary)" />
              <span style={{ fontSize: isMobile ? '12px' : '13px', color: 'var(--color-text-main)' }}>{item.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
