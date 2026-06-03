"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, Clock, Trophy, Target, Award, ListChecks } from 'lucide-react';
import { getCompletedSessions, CompletedSession } from '@/lib/storage';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');
  
  const [session, setSession] = useState<CompletedSession | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');

  useEffect(() => {
    setMounted(true);
    if (sessionId) {
      const allSessions = getCompletedSessions();
      const found = allSessions.find(s => s.id === sessionId);
      if (found) {
        setSession(found);
      }
    }
  }, [sessionId]);

  if (!mounted) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading your performance data...</div>;
  if (!session) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Result record not found.</div>;

  const formatTime = (s: number) => {
    if (!s) return 'N/A';
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceRemark = (pct: number) => {
    if (pct >= 80) return { text: 'Excellent Work!', color: '#22c55e' };
    if (pct >= 60) return { text: 'Good Performance!', color: '#3b82f6' };
    if (pct >= 40) return { text: 'Fair Attempt.', color: '#f59e0b' };
    return { text: 'Needs Improvement.', color: '#ef4444' };
  };

  const remark = getPerformanceRemark(session.pct);

  const filteredDetails = (session.details || []).filter(q => {
    if (filter === 'all') return true;
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect && q.userAnswer !== 'Skipped';
    if (filter === 'skipped') return q.userAnswer === 'Skipped';
    return true;
  });

  return (
    <div style={{ width: '100%', margin: '0 auto', paddingBottom: '80px', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Top Nav */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)', textDecoration: 'none', padding: '8px 16px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Slim Horizontal Hero Card */}
      <div style={{ background: 'var(--gradient-primary)', borderRadius: '16px', padding: '24px 32px', color: '#fff', boxShadow: '0 10px 30px rgba(75,15,163,0.15)', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Background glow effects */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(30px)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Award size={14} color="#F5B700" />
              {session.exam} {session.subject}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: remark.color, backgroundColor: '#fff', padding: '4px 12px', borderRadius: '12px', display: 'inline-flex', alignSelf: 'flex-start' }}>
              {remark.text}
            </div>
          </div>
          
          <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />
          
          <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1, color: '#fff', letterSpacing: '-1px' }}>
            {session.pct}%
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              <Target size={14} /> Score
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{session.score} <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>/ {session.total}</span></div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              <Clock size={14} /> Time Spent
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{formatTime(session.timeSpentSeconds || 0)}</div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '4px' }}>Question Review</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Review your answers and learn from your mistakes.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', backgroundColor: '#fff', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          {['all', 'correct', 'incorrect', 'skipped'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize',
                border: 'none',
                backgroundColor: filter === f ? 'var(--color-bg-main)' : 'transparent',
                color: filter === f ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Question List */}
      {session.details ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredDetails.length === 0 ? (
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
              <Trophy size={40} color="#e2e8f0" style={{ marginBottom: '16px' }} />
              <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>No questions found for this filter.</p>
            </div>
          ) : (
            filteredDetails.map((q, idx) => {
              const statusColor = q.isCorrect ? '#22c55e' : q.userAnswer === 'Skipped' ? '#94a3b8' : '#ef4444';
              const StatusIcon = q.isCorrect ? CheckCircle2 : q.userAnswer === 'Skipped' ? MinusCircle : XCircle;
              const bgColor = q.isCorrect ? '#f0fdf4' : q.userAnswer === 'Skipped' ? '#f8fafc' : '#fef2f2';

              return (
                <div key={q.questionId} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
                  
                  {/* Status Indicator Line */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: statusColor }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <StatusIcon size={18} color={statusColor} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Question {idx + 1}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backgroundColor: bgColor, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {q.isCorrect ? 'Correct' : q.userAnswer === 'Skipped' ? 'Skipped' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px', color: 'var(--color-text-main)', lineHeight: 1.6 }}>{q.questionText}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Your Answer</span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: statusColor }}>Option {q.userAnswer}</span>
                        </div>
                        
                        {!q.isCorrect && (
                          <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Correct Answer</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>Option {q.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Detailed records are not available for this session.</p>
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading results...</div>}>
      <ResultContent />
    </Suspense>
  );
}
