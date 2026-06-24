"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Timer, ArrowLeft, ArrowRight, Flag, CheckCheck, BookOpen, AlertCircle, Calculator } from 'lucide-react';
import { saveActiveSession, getActiveSession, clearActiveSession } from '@/lib/storage';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ScientificCalculator from '@/components/ScientificCalculator';

function CBTContent({ params }: { params: Promise<{ exam: string, subject: string }> }) {
  const router = useRouter();
  const { exam, subject } = use(params);
  const { token } = useAuth();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedQuestions = await api.getQuestions({ exam, subject, limit: 100 });
        
        // Transform questions to match the expected format
        const transformedQuestions = (fetchedQuestions || []).map((q: any) => ({
          id: q._id,
          question: q.text,
          options: {
            A: q.options[0],
            B: q.options[1],
            C: q.options[2],
            D: q.options[3]
          },
          correct_answer: q.correctAnswer,
          explanation: q.explanation
        }));
        
        setQuestions(transformedQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [exam, subject, token]);

  useEffect(() => {
    const session = getActiveSession();
    if (session && session.exam === exam && session.subject === subject) {
      setCurrentQIndex(session.currentQIndex);
      setAnswers(session.answers);
      setFlagged(new Set(session.flagged));
      setTimeLeft(session.timeLeft);
    }
    setSessionLoaded(true);
  }, [exam, subject]);

  useEffect(() => {
    if (!sessionLoaded || isSubmitted) return;
    saveActiveSession({ exam, subject, currentQIndex, answers, flagged: Array.from(flagged), timeLeft, lastAccessed: Date.now(), totalQ: questions.length });
  }, [currentQIndex, answers, flagged, timeLeft, exam, subject, sessionLoaded, isSubmitted, questions.length]);

  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  });

  const formatTime = (s: number) => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BookOpen size={20} color="#fff" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Loading Exam...</div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Fetching questions from server</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={20} color="#dc2626" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Error Loading Exam</div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{error}</div>
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={20} color="#D97706" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>No Questions Available</div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>There are no questions for this exam and subject combination.</div>
      </div>
    </div>
  );

  const q = questions[currentQIndex];
  const opts: [string, string][] = q ? [['A', q.options.A], ['B', q.options.B], ['C', q.options.C], ['D', q.options.D]] : [['A', ''], ['B', ''], ['C', ''], ['D', '']];
  const answered = Object.keys(answers).length;
  const isTimeLow = timeLeft < 300;

  const handleSubmit = async () => {
    setIsSubmitted(true);
    const correct = (questions || []).filter(q => answers[q.id] === q.correct_answer).length;
    const total = (questions || []).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const details = (questions || []).map(q => ({
      questionId: q.id,
      questionText: q.question,
      userAnswer: answers[q.id] || "Skipped",
      correctAnswer: q.correct_answer,
      isCorrect: answers[q.id] === q.correct_answer,
      explanation: q.explanation || '',
    }));

    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      const sessionData = {
        exam,
        subject,
        score: correct,
        total,
        percentage: pct,
        timeSpentSeconds: 3600 - timeLeft,
        details,
      };

      const savedSession = await api.saveSession(token, sessionData);
      const sessionId = savedSession._id || savedSession.id;
      
      clearActiveSession();
      setTimeout(() => router.push(`/dashboard/result?id=${sessionId}`), 800);
    } catch (error) {
      console.error('Error saving session:', error);
      // Fallback to local storage if API fails
      const sessionId = `${exam}-${subject}-${Date.now()}`;
      localStorage.setItem(`completed_${sessionId}`, JSON.stringify({
        id: sessionId, exam, subject, score: correct, total, pct, date: Date.now(), timeSpentSeconds: 3600 - timeLeft, details
      }));
      clearActiveSession();
      setTimeout(() => router.push(`/dashboard/result?id=${sessionId}`), 800);
    }
  };

  const toggleFlag = () => {
    setFlagged(prev => { const next = new Set(prev); next.has(q.id) ? next.delete(q.id) : next.add(q.id); return next; });
  };

  if (isSubmitted) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCheck size={26} color="#fff" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Exam Submitted!</div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Calculating your results, please wait...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: 'var(--color-bg-main)' }}>

      {/* Submit Confirm Modal */}
      {showSubmitConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertCircle size={22} color="#D97706" />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>Submit Exam?</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>This action cannot be undone.</div>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--color-bg-main)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Answered</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{answered} / {questions.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Unanswered</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>{questions.length - answered}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{ flex: 1, padding: '11px', borderRadius: '9px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-main)' }}>
                Go Back
              </button>
              <button onClick={handleSubmit} style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: 'var(--gradient-primary)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#fff' }}>
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scientific Calculator */}
      {showCalculator && <ScientificCalculator onClose={() => setShowCalculator(false)} />}

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 28px', backgroundColor: '#0f172a', color: '#fff', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#64748b' }}>{exam} · {subject}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>CBT Practice Mode</div>
          </div>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: isTimeLow ? '#dc2626' : '#1e293b', padding: '8px 18px', borderRadius: '10px', border: `1px solid ${isTimeLow ? '#ef4444' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.3s' }}>
          <Timer size={15} style={{ color: isTimeLow ? '#fff' : '#D97706' }} />
          <span style={{ fontSize: '16px', fontWeight: 800, color: isTimeLow ? '#fff' : '#D97706', fontVariantNumeric: 'tabular-nums', letterSpacing: '1px' }}>{formatTime(timeLeft)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#22c55e' }}>{answered}</div>
              <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Done</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>{flagged.size}</div>
              <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Flagged</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#94a3b8' }}>{questions.length - answered}</div>
              <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Left</div>
            </div>
          </div>
          <button onClick={() => setShowCalculator(!showCalculator)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: '9px', background: showCalculator ? '#7B2FF7' : '#1e293b', color: '#fff', fontWeight: 700, fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.15s' }}>
            <Calculator size={15} /> Calculator
          </button>
          <button onClick={() => setShowSubmitConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: '9px', background: 'var(--gradient-primary)', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px rgba(123,47,247,0.4)' }}>
            <CheckCheck size={15} /> Submit Exam
          </button>
        </div>
      </div>

      {/* Body: Question Only (no sidebar) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>

          {/* Question Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                Question {currentQIndex + 1} <span style={{ opacity: 0.6 }}>of {questions.length}</span>
              </span>
            </div>
            <button onClick={toggleFlag} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: flagged.has(q.id) ? '#D97706' : 'var(--color-text-muted)', background: flagged.has(q.id) ? '#FEF3C7' : '#f1f5f9', border: 'none', borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Flag size={13} fill={flagged.has(q.id) ? '#D97706' : 'none'} />
              {flagged.has(q.id) ? 'Flagged' : 'Flag for Review'}
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '28px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentQIndex + 1) / questions.length) * 100}%`, background: 'var(--gradient-primary)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>

          {/* Question Text */}
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '28px', border: '1px solid var(--glass-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', lineHeight: '1.75', margin: 0 }}>
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            {(opts || []).map(([letter, text]) => {
              const isSelected = answers[q.id] === letter;
              return (
                <button key={letter} onClick={() => setAnswers({ ...answers, [q.id]: letter })} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px', borderRadius: '12px', textAlign: 'left', width: '100%',
                  border: isSelected ? '2px solid #7B2FF7' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? 'rgba(123, 47, 247, 0.05)' : '#fff',
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 0 0 4px rgba(123,47,247,0.08)' : '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  <span style={{
                    width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '13px', flexShrink: 0,
                    backgroundColor: isSelected ? '#7B2FF7' : '#f1f5f9',
                    color: isSelected ? '#fff' : '#64748b',
                    transition: 'all 0.18s'
                  }}>
                    {letter}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: isSelected ? 600 : 400, color: 'var(--color-text-main)', lineHeight: '1.5' }}>{text}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <button onClick={() => setCurrentQIndex(i => Math.max(0, i - 1))} disabled={currentQIndex === 0} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '9px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', cursor: currentQIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentQIndex === 0 ? 0.4 : 1, transition: 'all 0.15s' }}>
              <ArrowLeft size={15} /> Previous
            </button>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{currentQIndex + 1} / {questions.length}</span>
            {currentQIndex === questions.length - 1 ? (
              <button onClick={() => setShowSubmitConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '9px', border: 'none', background: 'var(--gradient-primary)', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 2px 12px rgba(123,47,247,0.4)', transition: 'all 0.15s' }}>
                <CheckCheck size={15} /> Submit
              </button>
            ) : (
              <button onClick={() => setCurrentQIndex(i => Math.min(questions.length - 1, i + 1))} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '9px', border: 'none', background: 'var(--gradient-primary)', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
                Next <ArrowRight size={15} />
              </button>
            )}
          </div>

          {/* Question Navigator — Bottom */}
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid var(--glass-border)', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#94a3b8', margin: 0 }}>Question Navigator</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { bg: '#7B2FF7', border: '#7B2FF7', label: 'Answered' },
                  { bg: '#f8fafc', border: '#e2e8f0', label: 'Unanswered' },
                  { bg: '#FEF3C7', border: '#FEF3C7', label: 'Flagged' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: l.bg, border: `1px solid ${l.border}`, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Added max height and scroll to support 100 questions cleanly */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', maxHeight: '180px', overflowY: 'auto', paddingRight: '8px' }}>
              {(questions || []).map((mq, idx) => {
                const isAnswered = answers[mq.id] !== undefined;
                const isCurrent = idx === currentQIndex;
                const isFlagged = flagged.has(mq.id);
                return (
                  <button key={mq.id} onClick={() => setCurrentQIndex(idx)} style={{
                    width: '36px', height: '36px', borderRadius: '9px',
                    fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: isCurrent ? '2px solid #7B2FF7' : '1px solid #e2e8f0',
                    backgroundColor: isFlagged ? '#FEF3C7' : isAnswered ? '#7B2FF7' : '#f8fafc',
                    color: isFlagged ? '#D97706' : isAnswered ? '#fff' : '#94a3b8',
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: isCurrent ? '0 0 0 3px rgba(123,47,247,0.2)' : 'none'
                  }}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
}

export default function CBTMode({ params }: { params: Promise<{ exam: string, subject: string }> }) {
  return <Suspense fallback={null}><CBTContent params={params} /></Suspense>;
}
