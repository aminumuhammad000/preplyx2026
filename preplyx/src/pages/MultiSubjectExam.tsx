import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Timer, ArrowLeft, ArrowRight, Flag, CheckCheck, BookOpen, AlertCircle, Grid3x3, ChevronDown, X, Calculator, Volume2, VolumeX, Save, Sparkles, LogOut, FileText, Info } from 'lucide-react';
import { saveActiveSession, getActiveSession, clearActiveSession, saveCompletedSession } from '@/lib/storage';
import { generateQuestions, Question } from '@/lib/questionGenerator';
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

export default function MultiSubjectExam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  
  const exam = searchParams.get('exam') || 'JAMB';
  const year = searchParams.get('year') || '2018';
  const subjectsParam = searchParams.get('subjects') || '';
  const initialTime = parseInt(searchParams.get('time') || '3600');
  
  const subjects = useMemo(() => subjectsParam.split(',').filter(s => s.trim()), [subjectsParam]);
  
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentSubject, setCurrentSubject] = useState(subjects[0] || '');
  const [showSubjectSwitcher, setShowSubjectSwitcher] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [allQuestions, setAllQuestions] = useState<Record<string, Question[]>>({});
  
  useEffect(() => {
    setMounted(true);
    const loadSubjectQuestions = async () => {
      const map: Record<string, Question[]> = {};
      for (const subject of subjects) {
        try {
          const fetched = await api.getQuestions({ exam, subject, year, limit: 60 }, token || undefined).catch(() => []);
          if (fetched && fetched.length > 0) {
            map[subject] = fetched.map((q: any) => ({
              id: q._id || q.id,
              year: q.year || year,
              question: q.text || q.question,
              options: Array.isArray(q.options)
                ? { A: q.options[0] || '', B: q.options[1] || '', C: q.options[2] || '', D: q.options[3] || '' }
                : q.options,
              correct_answer: (q.correctAnswer || q.correct_answer || 'A') as any,
              explanation: q.explanation || ''
            }));
          } else {
            map[subject] = generateQuestions(subject, 60, year);
          }
        } catch {
          map[subject] = generateQuestions(subject, 60, year);
        }
      }
      setAllQuestions(map);
    };

    loadSubjectQuestions();
  }, [subjects, exam, year, token]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(initialTime);
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

  const currentQuestions = allQuestions[currentSubject] || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (sessionLoaded) return;
    
    const session = getActiveSession();
    if (session && session.exam === exam && session.subjects && session.subjects.join(',') === subjectsParam) {
      setCurrentSubjectIndex(session.currentSubjectIndex || 0);
      setCurrentSubject(session.currentSubject || subjects[0]);
      setCurrentQIndex(session.currentQIndex);
      setAnswers(session.answers);
      setFlagged(new Set(session.flagged));
      if (session.timeLeft) {
        setTimeLeft(session.timeLeft);
      }
    }
    setSessionLoaded(true);
  }, [exam, subjectsParam, subjects, sessionLoaded]);

  // Continuous Autosave
  useEffect(() => {
    if (!sessionLoaded || isSubmitted) return;

    saveActiveSession({
      exam,
      subject: currentSubject,
      subjects,
      currentSubject,
      currentSubjectIndex,
      currentQIndex,
      answers,
      flagged: Array.from(flagged),
      totalQ: (currentQuestions || []).length,
      timestamp: Date.now(),
      timeLeft
    });

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSaved(nowStr);
  }, [exam, currentSubject, subjects, currentSubjectIndex, currentQIndex, answers, flagged, currentQuestions, sessionLoaded, isSubmitted, timeLeft]);

  // Periodic interval autosave every 5s
  useEffect(() => {
    if (!sessionLoaded || isSubmitted) return;

    const interval = setInterval(() => {
      saveActiveSession({
        exam,
        subject: currentSubject,
        subjects,
        currentSubject,
        currentSubjectIndex,
        currentQIndex,
        answers,
        flagged: Array.from(flagged),
        totalQ: (currentQuestions || []).length,
        timestamp: Date.now(),
        timeLeft
      });
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSaved(nowStr);
    }, 5000);

    return () => clearInterval(interval);
  }, [exam, currentSubject, subjects, currentSubjectIndex, currentQIndex, answers, flagged, currentQuestions, sessionLoaded, isSubmitted, timeLeft]);

  useEffect(() => {
    if (isSubmitted || !mounted) return;

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
  }, [isSubmitted, mounted]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmitted) {
        e.preventDefault();
        e.returnValue = 'Your active multi-subject exam is running. Are you sure you want to exit?';
        return 'Your active multi-subject exam is running. Are you sure you want to exit?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitted]);

  const currentQ = currentQuestions[currentQIndex];

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

  const handleNext = () => {
    if (currentQIndex < (currentQuestions || []).length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else if (currentSubjectIndex < subjects.length - 1) {
      const nextSubjectIndex = currentSubjectIndex + 1;
      setCurrentSubjectIndex(nextSubjectIndex);
      setCurrentSubject(subjects[nextSubjectIndex]);
      setCurrentQIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    } else if (currentSubjectIndex > 0) {
      const prevSubjectIndex = currentSubjectIndex - 1;
      setCurrentSubjectIndex(prevSubjectIndex);
      setCurrentSubject(subjects[prevSubjectIndex]);
      const prevSubjectQuestions = allQuestions[subjects[prevSubjectIndex]] || [];
      setCurrentQIndex((prevSubjectQuestions || []).length - 1);
    }
  };

  const handleSwitchSubject = (index: number) => {
    setCurrentSubjectIndex(index);
    setCurrentSubject(subjects[index]);
    setCurrentQIndex(0);
    setShowSubjectSwitcher(false);
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQIndex(index);
    setShowSubjectSwitcher(false);
  };

  const handleSubmitExam = async () => {
    setIsSubmitted(true);
    playExamCompleteSound();
    clearActiveSession();

    let totalScore = 0;
    let totalQuestionsCount = 0;
    const subjectResults: Record<string, { score: number; total: number; pct: number }> = {};

    subjects.forEach(subj => {
      const questions = allQuestions[subj] || [];
      let subjScore = 0;
      
      questions.forEach(q => {
        const correct = (q as any).correctAnswer || (q as any).correct_answer;
        if (answers[q.id] === correct) {
          subjScore++;
        }
      });

      const subjTotal = (questions || []).length;
      totalScore += subjScore;
      totalQuestionsCount += subjTotal;

      subjectResults[subj] = {
        score: subjScore,
        total: subjTotal,
        pct: subjTotal > 0 ? Math.round((subjScore / subjTotal) * 100) : 0
      };
    });

    const overallPct = totalQuestionsCount > 0 ? Math.round((totalScore / totalQuestionsCount) * 100) : 0;
    const resultId = `result_${Date.now()}`;
    const timeSpentSeconds = initialTime - timeLeft;

    const answeredCount = Object.keys(answers).length;
    const sessionStatus = timeLeft <= 0 ? 'timed_out' : (answeredCount === 0 ? 'abandoned_0_answers' : 'completed');

    saveCompletedSession({
      id: resultId,
      exam,
      subject: subjects.join(', '),
      score: totalScore,
      total: totalQuestionsCount,
      pct: overallPct,
      date: Date.now(),
      status: sessionStatus,
      answeredCount,
      answers,
      questions: Object.values(allQuestions).flat(),
      timeSpentSeconds,
      subjectResults
    });

    if (token) {
      api.saveSession(token, {
        exam,
        subject: subjects.join(', '),
        score: totalScore,
        total: totalQuestionsCount,
        percentage: overallPct,
        timeSpentSeconds
      }).catch(err => console.warn('Backend session sync warning:', err));
    }

    navigate(`/dashboard/result?id=${resultId}`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateSubjectProgress = (subjectName: string) => {
    const questions = allQuestions[subjectName] || [];
    const answeredCount = (questions || []).filter(q => answers[q.id]).length;
    return {
      answered: answeredCount,
      total: (questions || []).length,
      pct: (questions || []).length > 0 ? Math.round((answeredCount / (questions || []).length) * 100) : 0
    };
  };

  const isLowTime = timeLeft < 600;

  if (!mounted || !sessionLoaded) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Preparing multi-subject exam...</div>;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
                {exam} CBT Exam
              </h1>
              <span style={{
                fontSize: '11px', fontWeight: 700, backgroundColor: '#F3E8FF',
                color: '#7B2FF7', padding: '2px 9px', borderRadius: '12px',
                letterSpacing: '0.3px'
              }}>
                Year {year}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} · {(currentQuestions || []).length * subjects.length} total questions · {year} Past Questions
            </p>
          </div>
        </div>

        {/* Subject Switcher and Controls */}
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

          {/* Calculator Toggle Button */}
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            style={{
              padding: '8px 14px', borderRadius: '10px',
              backgroundColor: showCalculator ? '#7B2FF7' : 'rgba(123, 47, 247, 0.1)',
              color: showCalculator ? '#fff' : '#7B2FF7',
              border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Calculator size={16} />
            Calculator
          </button>

          {/* Subject Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSubjectSwitcher(!showSubjectSwitcher)}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                backgroundColor: 'rgba(75,15,163,0.08)', color: '#4B0FA3',
                border: '1px solid rgba(75,15,163,0.2)', cursor: 'pointer',
                fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <BookOpen size={16} />
              <span>{currentSubject}</span>
              <ChevronDown size={14} />
            </button>

            {showSubjectSwitcher && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                width: '280px', backgroundColor: '#fff', borderRadius: '12px',
                border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                zIndex: 1000, padding: '8px'
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', padding: '8px 12px 4px 12px' }}>
                  Switch Subject
                </p>
                {subjects.map((subj, idx) => {
                  const progress = calculateSubjectProgress(subj);
                  const isCurrent = idx === currentSubjectIndex;
                  return (
                    <button
                      key={subj}
                      onClick={() => handleSwitchSubject(idx)}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: 'none', backgroundColor: isCurrent ? 'rgba(75,15,163,0.1)' : 'transparent',
                        color: isCurrent ? '#4B0FA3' : 'var(--color-text-main)',
                        textAlign: 'left', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: '13px', fontWeight: isCurrent ? 700 : 500
                      }}
                    >
                      <span>{subj}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {progress.answered}/{progress.total}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <FocusMusicWidget />

          {/* Timer Display */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '10px',
            backgroundColor: isLowTime ? '#fee2e2' : '#f1f5f9',
            color: isLowTime ? '#dc2626' : 'var(--color-text-main)',
            fontWeight: 700, fontSize: '14px'
          }}>
            <Timer size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            style={{
              padding: '10px 20px', borderRadius: '10px',
              backgroundColor: '#16a34a', color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <CheckCheck size={16} /> Submit Exam
          </button>
        </div>
      </div>

      {/* Main Content Area: Expanded question card & 250px sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '20px', alignItems: 'start' }}>
        {/* Question Area */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          {currentQ ? (
            <>
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#4B0FA3' }}>
                    Question {currentQIndex + 1} of {(currentQuestions || []).length}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    ({currentSubject})
                  </span>
                </div>

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
                  <Flag size={14} />
                  {flagged.has(currentQ.id) ? 'Flagged' : 'Flag Question'}
                </button>
              </div>

              {/* Question Title & Collapsible Description Toggle Card */}
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

              {/* Question Text */}
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

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {(Array.isArray(currentQ.options)
                  ? currentQ.options
                  : Object.entries(currentQ.options || {}).map(([id, text]) => ({ id, text }))
                ).map((option: any) => {
                  const isSelected = answers[currentQ.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      style={{
                        padding: '16px 20px', borderRadius: '12px',
                        border: isSelected ? '2px solid #7B2FF7' : '1px solid var(--glass-border)',
                        backgroundColor: isSelected ? 'rgba(123, 47, 247, 0.05)' : '#fff',
                        textAlign: 'left', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '14px',
                        transition: 'all 0.2s ease'
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
                        {option.id}
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--color-text-main)', fontWeight: isSelected ? 600 : 400 }}>
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={handlePrevious}
                  disabled={currentQIndex === 0 && currentSubjectIndex === 0}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: '1px solid var(--glass-border)', backgroundColor: '#fff',
                    color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 600,
                    cursor: (currentQIndex === 0 && currentSubjectIndex === 0) ? 'not-allowed' : 'pointer',
                    opacity: (currentQIndex === 0 && currentSubjectIndex === 0) ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <ArrowLeft size={16} /> Previous
                </button>

                {currentQIndex === (currentQuestions || []).length - 1 && currentSubjectIndex === subjects.length - 1 ? (
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
                    onClick={handleNext}
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
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              No questions found for this subject.
            </div>
          )}
        </div>

        {/* Sidebar: Subject Summary & Navigator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Scientific Calculator (Shown as popup/card when active) */}
          {showCalculator && (
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Calculator</span>
                <button onClick={() => setShowCalculator(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
              <ScientificCalculator onClose={() => setShowCalculator(false)} />
            </div>
          )}

          {/* Subject Navigation List */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
              Subject Overview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subjects.map((subj, idx) => {
                const progress = calculateSubjectProgress(subj);
                const isCurrent = idx === currentSubjectIndex;

                return (
                  <div
                    key={subj}
                    onClick={() => handleSwitchSubject(idx)}
                    style={{
                      padding: '12px', borderRadius: '10px',
                      backgroundColor: isCurrent ? 'rgba(75,15,163,0.05)' : '#f8fafc',
                      border: isCurrent ? '1px solid #7B2FF7' : '1px solid var(--glass-border)',
                      cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isCurrent ? '#7B2FF7' : 'var(--color-text-main)' }}>
                        {subj}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        {progress.answered}/{progress.total}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progress.pct}%`, height: '100%',
                        backgroundColor: isCurrent ? '#7B2FF7' : '#16a34a',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Grid Navigator */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '18px 20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '4px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0, whiteSpace: 'nowrap' }}>
                Questions
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {(currentQuestions || []).filter(q => answers[q.id]).length}/{(currentQuestions || []).length} Answered
              </span>
            </div>

            <div className="question-navigator-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {(currentQuestions || []).map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentQIndex;
                const isFlagged = flagged.has(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
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
          subject: currentSubject,
          questionNumber: currentQIndex + 1,
          totalQuestions: (currentQuestions || []).length,
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
            maxWidth: '440px', width: '100%', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertCircle size={28} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
              Ready to Submit?
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              You are about to submit your multi-subject exam. Make sure you have reviewed all flagged and unanswered questions.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: '1px solid var(--glass-border)', backgroundColor: '#fff',
                  color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Continue Test
              </button>

              <button
                onClick={handleSubmitExam}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: 'none', backgroundColor: '#16a34a',
                  color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Submit Now
              </button>
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
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>Your active exam progress is automatically saved! You can safely resume this multi-subject session anytime from your dashboard.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowExitConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', backgroundColor: '#fff', color: 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer' }}>Continue Test</button>
              <button onClick={() => navigate('/dashboard/practice')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Exit Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
