import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, Clock, Trophy, Target, Award, RefreshCw, Lock, Eye, EyeOff, CreditCard, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import VictoryCelebration from '../components/VictoryCelebration';
import { getCompletedSessionById } from '../lib/storage';

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');
  const { token } = useAuth();
  
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Result Unlock & Wallet state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (!sessionId) return false;
    return localStorage.getItem(`preplyx_unlocked_result_${sessionId}`) === 'true';
  });
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Revealed Correct Answers state
  const [revealedQuestions, setRevealedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    
    if (token) {
      api.getWallet(token)
        .then(w => setWalletBalance(w?.balance ?? 0))
        .catch(() => setWalletBalance(0));
    }

    const fetchSession = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: any = null;

        // Try backend if token exists and ID is not a local client ID
        if (token && sessionId && !sessionId.startsWith('result_')) {
          try {
            data = await api.getSession(token, sessionId);
          } catch (serverErr) {
            console.warn('Could not retrieve session from server:', serverErr);
          }
        }

        // Search local session storage
        if (!data) {
          data = getCompletedSessionById(sessionId);
        }

        if (data) {
          setSession(data);
          const pctVal = data.pct !== undefined ? data.pct : (data.score && data.total ? Math.round((data.score / data.total) * 100) : 0);
          if (pctVal >= 50) {
            setShowCelebration(true);
          }
        } else {
          setError('No practice exam session results found on server.');
        }
      } catch (err) {
        console.error('Error loading session result:', err);
        setError('Failed to load session result.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, token]);

  const handleUnlockResult = async () => {
    if (!token) {
      setUnlockError('Please log in to unlock detailed test results.');
      return;
    }

    setUnlocking(true);
    setUnlockError(null);

    try {
      const res = await api.deductWallet(token, 10, 'Result Detailed Breakdown Unlock');
      if (res && res.balance !== undefined) {
        setWalletBalance(res.balance);
      }
      if (sessionId) {
        localStorage.setItem(`preplyx_unlocked_result_${sessionId}`, 'true');
      }
      setIsUnlocked(true);
    } catch (err: any) {
      setUnlockError(err?.message || 'Insufficient wallet balance. You need at least 10 credits to unlock results.');
    } finally {
      setUnlocking(false);
    }
  };

  const toggleRevealQuestion = (qId: string) => {
    setRevealedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  if (!mounted || loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading results...</div>;
  }

  if (error || !session) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        maxWidth: '520px',
        margin: '40px auto'
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          backgroundColor: '#F3E8FF', color: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Award size={28} />
        </div>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
          No Server Session Results Found
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
          {error || 'Start a practice CBT exam to generate real performance results.'}
        </p>
        <button
          onClick={() => navigate('/dashboard/practice')}
          style={{
            padding: '12px 24px', borderRadius: '12px',
            background: 'var(--gradient-primary)', color: '#fff',
            border: 'none', fontWeight: 700, cursor: 'pointer',
            fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}
        >
          <RefreshCw size={15} /> Launch Practice CBT
        </button>
      </div>
    );
  }

  const { exam, subject, score, total, pct, answers = {}, questions = [], timeSpentSeconds, subjectResults } = session;
  const correctCount = score;
  const skippedCount = questions.filter((q: any) => !answers[q.id]).length;
  const incorrectCount = total - correctCount - skippedCount;

  const filteredQuestions = questions.filter((q: any) => {
    const userAns = answers[q.id];
    if (filter === 'correct') return userAns === q.correctAnswer;
    if (filter === 'incorrect') return userAns && userAns !== q.correctAnswer;
    if (filter === 'skipped') return !userAns;
    return true;
  });

  const getPerformanceBadge = () => {
    if (pct >= 80) return { label: 'Excellent!', color: '#16a34a', bg: '#dcfce7', icon: Trophy };
    if (pct >= 60) return { label: 'Good Job!', color: '#d97706', bg: '#fef3c7', icon: Target };
    return { label: 'Keep Practicing', color: '#dc2626', bg: '#fee2e2', icon: Award };
  };

  const badge = getPerformanceBadge();
  const BadgeIcon = badge.icon;

  const formatTimeSpent = (sec?: number) => {
    if (!sec) return 'N/A';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button
          onClick={() => navigate('/dashboard/practice')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '10px',
            backgroundColor: '#fff', border: '1px solid var(--glass-border)',
            color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Back to Practice
        </button>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
            {exam} Exam Performance Breakdown
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            {subject ? `${subject} • ` : ''}Detailed CBT Score Card & Analysis
          </p>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px', padding: '32px',
        border: '1px solid var(--glass-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', alignItems: 'center' }}>
          
          {/* Big Score Ring */}
          <div style={{ textAlign: 'center', paddingRight: '20px', borderRight: '1px solid #f1f5f9' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: `conic-gradient(#7B2FF7 ${pct}%, #f1f5f9 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', position: 'relative'
            }}>
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                backgroundColor: '#fff', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '17px', fontWeight: 700, color: '#7B2FF7', lineHeight: 1 }}>
                  {pct}%
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  Overall Score
                </span>
              </div>
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '20px',
              backgroundColor: badge.bg, color: badge.color,
              fontSize: '13px', fontWeight: 700
            }}>
              <BadgeIcon size={16} />
              <span>{badge.label}</span>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', marginBottom: '4px' }}>
                <CheckCircle2 size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Correct Answers</span>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 600, color: '#15803d' }}>
                {correctCount} <span style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>/ {total}</span>
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '4px' }}>
                <XCircle size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Incorrect Answers</span>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 600, color: '#b91c1c' }}>
                {incorrectCount} <span style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>/ {total}</span>
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '4px' }}>
                <MinusCircle size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Skipped Questions</span>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 600, color: '#334155' }}>
                {skippedCount} <span style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>/ {total}</span>
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7B2FF7', marginBottom: '4px' }}>
                <Clock size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Time Spent</span>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 600, color: '#4c1d95' }}>
                {formatTimeSpent(timeSpentSeconds)}
              </div>
            </div>
          </div>

        </div>

        {/* Multi-Subject breakdown if applicable */}
        {subjectResults && Object.keys(subjectResults).length > 0 && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
              Subject Performance Summary
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {Object.entries(subjectResults).map(([subjName, res]: [string, any]) => (
                <div key={subjName} style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{subjName}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#7B2FF7' }}>
                    {res.score}/{res.total} ({res.pct}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Wallet Result Unlock Lock Gate */}
      {!isUnlocked ? (
        <div style={{
          padding: '36px 28px', borderRadius: '20px',
          backgroundColor: '#ffffff', border: '2px dashed rgba(123, 47, 247, 0.3)',
          boxShadow: '0 10px 30px rgba(123, 47, 247, 0.08)', textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #7B2FF7 0%, #4B0FA3 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(123, 47, 247, 0.3)'
          }}>
            <Lock size={28} />
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
            Unlock Detailed Question Breakdown
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Unlock full question-by-question review, step-by-step AI explanations, and correct option reveal keys for this exam session.
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '20px',
            padding: '12px 24px', borderRadius: '14px', backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0', marginBottom: '24px'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Unlock Fee</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#7B2FF7' }}>10 Credits</div>
            </div>
            <div style={{ width: '1px', height: '30px', backgroundColor: '#cbd5e1' }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Your Wallet Balance</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: (walletBalance ?? 0) >= 10 ? '#16a34a' : '#dc2626' }}>
                {walletBalance !== null ? `${walletBalance} Credits` : 'Loading...'}
              </div>
            </div>
          </div>

          {unlockError && (
            <div style={{
              margin: '0 auto 16px', maxWidth: '460px', padding: '12px 16px',
              borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', fontSize: '13px', fontWeight: 600
            }}>
              {unlockError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleUnlockResult}
              disabled={unlocking}
              style={{
                padding: '12px 28px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #7B2FF7 0%, #4B0FA3 100%)',
                color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '14px',
                cursor: unlocking ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(123, 47, 247, 0.4)',
                display: 'inline-flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Lock size={16} />
              {unlocking ? 'Unlocking...' : 'Unlock Result (10 Credits)'}
            </button>

            {(walletBalance !== null && walletBalance < 10) && (
              <button
                onClick={() => navigate('/dashboard/wallet')}
                style={{
                  padding: '12px 24px', borderRadius: '12px',
                  backgroundColor: '#16a34a', color: '#ffffff',
                  border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '8px'
                }}
              >
                <CreditCard size={16} /> Top Up Wallet
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── Unlocked: Full Answer Reveal ── */
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid var(--glass-border)', marginBottom: '40px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={15} color="#16a34a" />
                Full Question Breakdown
                <span style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  UNLOCKED
                </span>
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                All correct answers are shown below. Your selections are highlighted.
              </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All (${questions.length})` },
                { id: 'correct', label: `Correct (${correctCount})` },
                { id: 'incorrect', label: `Incorrect (${incorrectCount})` },
                { id: 'skipped', label: `Skipped (${skippedCount})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px',
                    backgroundColor: filter === f.id ? '#7B2FF7' : '#f1f5f9',
                    color: filter === f.id ? '#fff' : '#475569',
                    border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colour Legend */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0', marginBottom: '20px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Legend:</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#15803d' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#dcfce7', border: '1.5px solid #16a34a', display: 'inline-block' }} />
              Correct Answer
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#b91c1c' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#fee2e2', border: '1.5px solid #dc2626', display: 'inline-block' }} />
              Your Wrong Pick
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f1f5f9', border: '1.5px solid #cbd5e1', display: 'inline-block' }} />
              Not Selected
            </span>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredQuestions.map((q: any, idx: number) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctAnswer;
              const isSkipped = !userAns;

              // Determine question card border colour
              const cardBorderColor = isSkipped ? '#e2e8f0' : isCorrect ? '#86efac' : '#fca5a5';
              const cardBgColor = isSkipped ? '#ffffff' : isCorrect ? '#f0fdf4' : '#fff5f5';

              const opts: any[] = Array.isArray(q.options)
                ? q.options
                : Object.entries(q.options || {}).map(([id, text]) => ({
                    id,
                    text: typeof text === 'string' ? text : (text as any)?.text || String(text)
                  }));

              return (
                <div
                  key={q.id || idx}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    backgroundColor: cardBgColor,
                    border: `1px solid ${cardBorderColor}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Question header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#7B2FF7' }}>Q{idx + 1}</span>
                      {isSkipped ? (
                        <span style={{ fontSize: '10px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MinusCircle size={10} /> Skipped
                        </span>
                      ) : isCorrect ? (
                        <span style={{ fontSize: '10px', fontWeight: 600, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={10} /> Correct
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 600, backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <XCircle size={10} /> Wrong
                        </span>
                      )}
                    </div>
                    {/* Correct answer key badge — always visible */}
                    <span style={{
                      fontSize: '11px', fontWeight: 600, color: '#15803d',
                      backgroundColor: '#dcfce7', padding: '3px 10px', borderRadius: '20px',
                      border: '1px solid #86efac', display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      <CheckCircle2 size={11} /> Answer: {q.correctAnswer}
                    </span>
                  </div>

                  {/* Question text */}
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', marginBottom: '14px', lineHeight: 1.6 }}>
                    {q.question}
                  </p>

                  {/* Options — all shown, colour-coded */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                    {opts.map((opt: any) => {
                      const isUserChoice = userAns === opt.id;
                      const isRightChoice = q.correctAnswer === opt.id;

                      // Priority: correct answer always green; user's wrong pick red; rest neutral
                      let bg = '#ffffff';
                      let border = '#e2e8f0';
                      let color = '#64748b';
                      let weight = 400;
                      let icon: React.ReactNode = null;

                      if (isRightChoice) {
                        bg = '#dcfce7';
                        border = '#16a34a';
                        color = '#15803d';
                        weight = 600;
                        icon = <CheckCircle2 size={13} style={{ flexShrink: 0 }} />;
                      } else if (isUserChoice && !isRightChoice) {
                        bg = '#fee2e2';
                        border = '#dc2626';
                        color = '#b91c1c';
                        weight = 600;
                        icon = <XCircle size={13} style={{ flexShrink: 0 }} />;
                      }

                      return (
                        <div
                          key={opt.id}
                          style={{
                            padding: '10px 14px', borderRadius: '10px',
                            backgroundColor: bg, border: `1.5px solid ${border}`,
                            color, fontSize: '13px', fontWeight: weight,
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontWeight: 700, flexShrink: 0, fontSize: '12px' }}>{opt.id}.</span>
                          <span style={{ flex: 1 }}>{opt.text}</span>
                          {icon}
                          {isUserChoice && isRightChoice && (
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#15803d', marginLeft: 'auto', whiteSpace: 'nowrap' }}>✓ Your Pick</span>
                          )}
                          {isUserChoice && !isRightChoice && (
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#b91c1c', marginLeft: 'auto', whiteSpace: 'nowrap' }}>Your Pick</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation — always visible when unlocked */}
                  {q.explanation && (
                    <div style={{
                      marginTop: '4px', padding: '12px 14px', borderRadius: '10px',
                      backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                      fontSize: '12px', color: '#78350f', lineHeight: 1.6
                    }}>
                      <span style={{ fontWeight: 600, color: '#92400e', marginRight: '4px' }}>💡 Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Floating Balloons & Confetti Victory Celebration Overlay */}
      {showCelebration && session && (
        <VictoryCelebration
          score={session.score || 0}
          total={session.total || 0}
          pct={session.pct !== undefined ? session.pct : (session.score && session.total ? Math.round((session.score / session.total) * 100) : 0)}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}
