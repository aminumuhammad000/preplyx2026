import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Timer, ArrowLeft, ArrowRight, Flag, CheckCheck, BookOpen, AlertCircle, Calculator, Volume2, VolumeX, Save, Check, Sparkles, LogOut, FileText, Info, ChevronDown } from 'lucide-react';
import { saveActiveSession, getActiveSession, clearActiveSession, saveCompletedSession } from '@/lib/storage';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ScientificCalculator from '@/components/ScientificCalculator';
import AiExamTutor from '@/components/AiExamTutor';
import FocusMusicWidget from '@/components/FocusMusicWidget';
import DynamicFocusBackground from '@/components/DynamicFocusBackground';
import { 
  playOptionSelectSound, playFlagSound, playTimerWarningSound, 
  playExamCompleteSound, playButtonClickSound, isSoundEnabled, setSoundEnabled 
} from '@/lib/soundEffects';

export default function CbtExamRunner() {
  const { exam = 'JAMB', subject = 'English' } = useParams<{ exam: string; subject: string }>();
  const [searchParams] = useSearchParams();
  const year = searchParams.get('year') || '2018';
  const navigate = useNavigate();
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [aiAction, setAiAction] = useState<string | undefined>(undefined);
  
  // Sound & Autosave state
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const timerWarnedRef = useRef<{ m5?: boolean; m1?: boolean }>({});

  const currentQ = questions[currentQIndex];

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedQuestions = await api.getQuestions({ exam, subject, year, limit: 100 }, token);
        
        const transformedQuestions = (fetchedQuestions || []).map((q: any) => ({
          id: q._id || q.id,
          question: q.text || q.question,
          options: Array.isArray(q.options) 
            ? [
                { id: 'A', text: q.options[0] },
                { id: 'B', text: q.options[1] },
                { id: 'C', text: q.options[2] },
                { id: 'D', text: q.options[3] }
              ]
            : Object.entries(q.options || {}).map(([key, val]) => ({ id: key, text: val })),
          correctAnswer: q.correctAnswer || q.correct_answer,
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
    if (sessionLoaded || loading || questions.length === 0) return;
    
    const session = getActiveSession();
    if (session && session.exam === exam && session.subject === subject) {
      setCurrentQIndex(session.currentQIndex);
      setAnswers(session.answers);
      setFlagged(new Set(session.flagged));
      if (session.timeLeft) {
        setTimeLeft(session.timeLeft);
      }
    }
    setSessionLoaded(true);
  }, [exam, subject, sessionLoaded, loading, questions]);

  // Continuous Autosave session progress
  useEffect(() => {
    if (!sessionLoaded || isSubmitted || questions.length === 0) return;

    saveActiveSession({
      exam,
      subject,
      currentQIndex,
      answers,
      flagged: Array.from(flagged),
      totalQ: questions.length,
      timestamp: Date.now(),
      timeLeft
    });

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSaved(nowStr);
  }, [exam, subject, currentQIndex, answers, flagged, questions, sessionLoaded, isSubmitted, timeLeft]);

  // Periodic autosave interval every 5s for smooth time tracking
  useEffect(() => {
    if (!sessionLoaded || isSubmitted || questions.length === 0) return;

    const interval = setInterval(() => {
      saveActiveSession({
        exam,
        subject,
        currentQIndex,
        answers,
        flagged: Array.from(flagged),
        totalQ: questions.length,
        timestamp: Date.now(),
        timeLeft
      });
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSaved(nowStr);
    }, 5000);

    return () => clearInterval(interval);
  }, [exam, subject, currentQIndex, answers, flagged, questions, sessionLoaded, isSubmitted, timeLeft]);

  useEffect(() => {
    if (isSubmitted || loading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }

        // Timer Warning Sounds (5 mins & 1 min)
        if (prev === 300 && !timerWarnedRef.current.m5) {
          timerWarnedRef.current.m5 = true;
          playTimerWarningSound();
        } else if (prev === 60 && !timerWarnedRef.current.m1) {
          timerWarnedRef.current.m1 = true;
          playTimerWarningSound();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, loading, questions]);

  // Automatically exit active exam session when leaving the exam page
  useEffect(() => {
    return () => {
      clearActiveSession();
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmitted) {
        e.preventDefault();
        e.returnValue = 'Your active CBT test is running. Are you sure you want to exit?';
        return 'Your active CBT test is running. Are you sure you want to exit?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitted]);

  const confirmExitExam = () => {
    const answeredCount = Object.keys(answers).length;
    saveCompletedSession({
      id: `result_${Date.now()}`,
      exam,
      subject,
      score: 0,
      total: questions.length,
      pct: 0,
      date: Date.now(),
      status: answeredCount === 0 ? 'abandoned_0_answers' : 'in_progress',
      answeredCount,
      answers,
      questions
    });
    navigate('/dashboard/practice');
  };

  const handleOptionSelect = (optionId: string) => {
    if (!currentQ || isSubmitted) return;

    playOptionSelectSound();

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  const handleFlagQuestion = () => {
    if (!currentQ) return;

    playFlagSound();

    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
      } else {
        next.add(currentQ.id);
      }
      return next;
    });
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playOptionSelectSound();
  };

  const handleSubmitExam = async () => {
    setIsSubmitted(true);
    playExamCompleteSound();
    clearActiveSession();

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const resultId = `result_${Date.now()}`;
    const timeSpentSeconds = 3600 - timeLeft;

    const answeredCount = Object.keys(answers).length;
    const sessionStatus = timeLeft <= 0 ? 'timed_out' : (answeredCount === 0 ? 'abandoned_0_answers' : 'completed');

    saveCompletedSession({
      id: resultId,
      exam,
      subject,
      score,
      total: questions.length,
      pct,
      date: Date.now(),
      status: sessionStatus,
      answeredCount,
      answers,
      questions,
      timeSpentSeconds
    });

    if (token) {
      api.saveSession(token, {
        exam,
        subject,
        score,
        total: questions.length,
        percentage: pct,
        timeSpentSeconds
      }).catch(err => console.warn('Backend session sync warning:', err));
    }

    navigate(`/dashboard/result?id=${resultId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <BookOpen size={40} color="#7B2FF7" />
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>Loading Exam Questions...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '15px', color: '#dc2626', marginBottom: '16px' }}>{error || 'No questions available for this exam/subject combination.'}</p>
        <button
          onClick={() => navigate('/dashboard/practice')}
          style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          Back to Practice Selection
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', position: 'relative', zIndex: 1 }}>
      <DynamicFocusBackground />
      {/* Exam Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', backgroundColor: '#fff', borderRadius: '16px',
        border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        marginBottom: '20px', flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            backgroundColor: 'rgba(123, 47, 247, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BookOpen size={20} color="#7B2FF7" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0, textTransform: 'capitalize' }}>
              {exam} {subject} Practice
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
              Question {currentQIndex + 1} of {questions.length}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {lastSaved && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '20px',
              backgroundColor: '#ecfdf5', color: '#059669',
              fontSize: '12px', fontWeight: 600, border: '1px solid #a7f3d0'
            }} title={`Progress autosaved at ${lastSaved}`}>
              <Save size={13} />
              <span>Autosaved</span>
            </div>
          )}

          <button
            onClick={toggleSound}
            title={soundOn ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Enable)'}
            style={{
              padding: '8px 12px', borderRadius: '10px',
              backgroundColor: soundOn ? '#ecfdf5' : '#f1f5f9',
              color: soundOn ? '#059669' : '#64748b',
              border: soundOn ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {soundOn ? <Volume2 size={16} color="#059669" /> : <VolumeX size={16} color="#64748b" />}
            <span>{soundOn ? 'Audio On' : 'Muted'}</span>
          </button>

          <FocusMusicWidget />

          <button
            onClick={() => setShowCalculator(!showCalculator)}
            style={{
              padding: '8px 14px', borderRadius: '10px',
              backgroundColor: showCalculator ? '#7B2FF7' : 'rgba(123, 47, 247, 0.1)',
              color: showCalculator ? '#fff' : '#7B2FF7',
              border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Calculator size={16} /> Calculator
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '10px',
            backgroundColor: '#f1f5f9', color: 'var(--color-text-main)',
            fontWeight: 700, fontSize: '14px'
          }}>
            <Timer size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            style={{
              padding: '10px 20px', borderRadius: '10px',
              backgroundColor: '#16a34a', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <CheckCheck size={16} /> Submit Test
          </button>
        </div>
      </div>

      {/* Main Grid: Wider main question area and 250px sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '20px', alignItems: 'start' }}>
        {/* Question Panel */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          {currentQ && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#7B2FF7' }}>
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <button
                  onClick={handleFlagQuestion}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    backgroundColor: flagged.has(currentQ.id) ? '#fef3c7' : '#fff',
                    color: flagged.has(currentQ.id) ? '#D97706' : 'var(--color-text-muted)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Flag size={14} /> {flagged.has(currentQ.id) ? 'Flagged' : 'Flag Question'}
                </button>
              </div>
              {(currentQ.title || currentQ.description) && (
                <div style={{
                  marginBottom: '20px', borderRadius: '12px',
                  backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                  overflow: 'hidden', transition: 'all 0.2s ease'
                }}>
                  <div 
                    onClick={() => setShowDescription(prev => !prev)}
                    style={{
                      padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', backgroundColor: showDescription ? 'rgba(123, 47, 247, 0.05)' : '#f8fafc',
                      borderBottom: showDescription ? '1px solid #e2e8f0' : 'none',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="#7B2FF7" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        {currentQ.title || 'Question Description & Passage'}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', fontWeight: 700, color: '#7B2FF7'
                    }}>
                      <span>{showDescription ? 'Hide Details' : 'View Description'}</span>
                      <ChevronDown 
                        size={14} 
                        style={{ 
                          transform: showDescription ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease' 
                        }} 
                      />
                    </div>
                  </div>

                  {showDescription && (currentQ.description || currentQ.title) && (
                    <div style={{
                      padding: '16px', fontSize: '13px', color: '#475569',
                      lineHeight: 1.6, backgroundColor: '#ffffff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <Info size={16} color="#7B2FF7" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>{currentQ.description || currentQ.title}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px', lineHeight: 1.5 }}>
                {currentQ.question}
              </div>

              {/* Compact AI Concept Action Pill */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => {
                    setAiAction('explain_concept');
                    setShowAiTutor(true);
                  }}
                  style={{
                    padding: '6px 14px', borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(123, 47, 247, 0.08) 0%, rgba(75, 15, 163, 0.04) 100%)',
                    border: '1px solid rgba(123, 47, 247, 0.25)',
                    color: '#6b21a8', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Get in-depth theoretical concept breakdown without revealing correct answer"
                >
                  <Sparkles size={13} color="#7B2FF7" />
                  <span>Explain Topic with AI</span>
                  <span style={{ fontSize: '9px', backgroundColor: '#e9d5ff', color: '#581c87', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                    NO ANSWER REVEALED
                  </span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {currentQ.options?.map((opt: any) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.id)}
                      style={{
                        padding: '16px 20px', borderRadius: '12px',
                        border: isSelected ? '2px solid #7B2FF7' : '1px solid var(--glass-border)',
                        backgroundColor: isSelected ? 'rgba(123, 47, 247, 0.05)' : '#fff',
                        textAlign: 'left', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '14px'
                      }}
                    >
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        border: isSelected ? '2px solid #7B2FF7' : '1px solid var(--glass-border)',
                        backgroundColor: isSelected ? '#7B2FF7' : '#fff',
                        color: isSelected ? '#fff' : 'var(--color-text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700
                      }}>
                        {opt.id}
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--color-text-main)', fontWeight: isSelected ? 600 : 400 }}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: '1px solid var(--glass-border)', backgroundColor: '#fff',
                    color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 600,
                    cursor: currentQIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentQIndex === 0 ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <ArrowLeft size={16} /> Previous
                </button>

                {currentQIndex === questions.length - 1 ? (
                  <button
                    onClick={() => {
                      playButtonClickSound();
                      setShowSubmitConfirm(true);
                    }}
                    style={{
                      padding: '10px 22px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
                    }}
                  >
                    <CheckCheck size={16} /> Submit Exam
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    style={{
                      padding: '10px 20px', borderRadius: '10px',
                      background: 'var(--gradient-primary)', color: '#fff',
                      border: 'none', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Navigator Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {showCalculator && (
            <ScientificCalculator onClose={() => setShowCalculator(false)} />
          )}

          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '18px 20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '4px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0, whiteSpace: 'nowrap' }}>Questions</h3>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {Object.keys(answers).length}/{questions.length} Answered
              </span>
            </div>

            <div className="question-navigator-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentQIndex;
                const isFlagged = flagged.has(q.id);

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentQIndex(idx)}
                    style={{
                      height: '36px', borderRadius: '8px',
                      border: isCurrent ? '2px solid #7B2FF7' : isFlagged ? '1px solid #D97706' : '1px solid var(--glass-border)',
                      backgroundColor: isCurrent ? '#7B2FF7' : isFlagged ? '#fef3c7' : isAnswered ? '#d1fae5' : '#f8fafc',
                      color: isCurrent ? '#fff' : isFlagged ? '#D97706' : isAnswered ? '#16a34a' : 'var(--color-text-main)',
                      fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Red Emphasized Exit Button at bottom of Question Navigator */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setShowExitConfirm(true)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                  color: '#dc2626', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogOut size={14} color="#dc2626" /> Exit Exam Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Exam Tutor Drawer */}
      <AiExamTutor
        isOpen={showAiTutor}
        onClose={() => {
          setShowAiTutor(false);
          setAiAction(undefined);
        }}
        initialAction={aiAction}
        context={{
          exam,
          subject,
          questionNumber: currentQIndex + 1,
          totalQuestions: questions.length,
          questionText: currentQ?.question,
          options: currentQ?.options,
          explanation: currentQ?.explanation
        }}
      />

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '20px', padding: '32px',
            maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>Submit Exam?</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>Are you sure you want to finish and submit your answers now?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', backgroundColor: '#fff', color: 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmitExam} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '20px', padding: '32px',
            maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <LogOut size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>Exit Exam Session?</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>Your active exam progress is automatically saved! You can safely resume this exam session anytime from your dashboard.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowExitConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', backgroundColor: '#fff', color: 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer' }}>Continue Test</button>
              <button onClick={confirmExitExam} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Exit Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
