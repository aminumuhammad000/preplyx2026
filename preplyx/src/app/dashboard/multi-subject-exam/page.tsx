"use client";
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Timer, ArrowLeft, ArrowRight, Flag, CheckCheck, BookOpen, AlertCircle, Grid3x3, ChevronDown, X, Calculator } from 'lucide-react';
import { saveActiveSession, getActiveSession, clearActiveSession, saveCompletedSession } from '@/lib/storage';
import { generateQuestions, Question } from '@/lib/questionGenerator';
import ScientificCalculator from '@/components/ScientificCalculator';

function MultiSubjectExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const exam = searchParams.get('exam') || 'JAMB';
  const subjectsParam = searchParams.get('subjects') || '';
  const initialTime = parseInt(searchParams.get('time') || '3600'); // Default to 1 hour
  
  // Memoize subjects to prevent infinite loop
  const subjects = useMemo(() => subjectsParam.split(',').filter(s => s.trim()), [subjectsParam]);
  
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentSubject, setCurrentSubject] = useState(subjects[0] || '');
  const [showSubjectSwitcher, setShowSubjectSwitcher] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Dynamically generate questions for all subjects (only on client after mount)
  const allQuestions = useMemo(() => {
    if (!mounted) return {}; // Don't generate during SSR
    const questionsMap: Record<string, Question[]> = {};
    subjects.forEach(subject => {
      questionsMap[subject] = generateQuestions(subject, 60); // 60 questions per subject
    });
    return questionsMap;
  }, [subjects, mounted]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Get questions for current subject
  const currentQuestions = allQuestions[currentSubject] || [];

  // Set mounted to true only on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (sessionLoaded) return; // Prevent re-running
    
    const session = getActiveSession();
    if (session && session.exam === exam && session.subjects && session.subjects.join(',') === subjectsParam) {
      setCurrentSubjectIndex(session.currentSubjectIndex || 0);
      setCurrentSubject(session.currentSubject || subjects[0]);
      setCurrentQIndex(session.currentQIndex);
      setAnswers(session.answers);
      setFlagged(new Set(session.flagged));
      setTimeLeft(session.timeLeft);
    }
    setSessionLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, subjectsParam]);

  useEffect(() => {
    if (!sessionLoaded || isSubmitted) return;
    saveActiveSession({ 
      exam, 
      subject: subjects.join(', '),
      subjects, 
      currentSubjectIndex, 
      currentSubject,
      currentQIndex, 
      answers, 
      flagged: Array.from(flagged), 
      timeLeft, 
      lastAccessed: Date.now(), 
      totalQ: currentQuestions.length 
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSubjectIndex, currentSubject, currentQIndex, answers, flagged, timeLeft, exam, subjectsParam, sessionLoaded, isSubmitted, currentQuestions.length]);

  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  });

  const formatTime = (s: number) => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const q = currentQuestions[currentQIndex];
  const opts: [string, string][] = q ? [['A', q.options.A], ['B', q.options.B], ['C', q.options.C], ['D', q.options.D]] : [['A', ''], ['B', ''], ['C', ''], ['D', '']];
  
  // Calculate total questions across all subjects
  const totalQuestions = Object.values(allQuestions).reduce((sum, qs) => sum + qs.length, 0);
  const answered = Object.keys(answers).length;
  const isTimeLow = timeLeft < 300;

  const handleSubmit = () => {
    setIsSubmitted(true);
    
    // Calculate score across all subjects
    let correct = 0;
    const details: any[] = [];
    
    Object.entries(allQuestions).forEach(([subject, questions]) => {
      questions.forEach(question => {
        const isCorrect = answers[question.id] === question.correct_answer;
        if (isCorrect) correct++;
        details.push({
          subject,
          questionId: question.id,
          questionText: question.question,
          userAnswer: answers[question.id] || "Skipped",
          correctAnswer: question.correct_answer,
          isCorrect,
          explanation: question.explanation || '',
        });
      });
    });
    
    const total = totalQuestions;
    const pct = Math.round((correct / total) * 100);
    const sessionId = `${exam}-${subjects.join('-')}-${Date.now()}`;
    saveCompletedSession({ 
      id: sessionId, 
      exam, 
      subject: subjects.join(', '), 
      score: correct, 
      total, 
      pct, 
      date: Date.now(), 
      timeSpentSeconds: initialTime - timeLeft, 
      details 
    });
    clearActiveSession();
    setTimeout(() => router.push(`/dashboard/result?id=${sessionId}`), 800);
  };

  const toggleFlag = () => {
    setFlagged(prev => { const next = new Set(prev); next.has(q.id) ? next.delete(q.id) : next.add(q.id); return next; });
  };

  const switchSubject = (index: number) => {
    setCurrentSubjectIndex(index);
    setCurrentSubject(subjects[index]);
    setCurrentQIndex(0);
    setShowSubjectSwitcher(false);
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [q.id]: answer }));
  };

  const handleNext = () => {
    if (currentQIndex < currentQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQIndex(index);
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

  if (!mounted) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BookOpen size={20} color="#fff" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Loading Exam...</div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Preparing your questions</div>
      </div>
    </div>
  );

  if (!q) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
      <AlertCircle size={48} color="#ef4444" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>No questions available</div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Please try selecting a different subject</div>
      </div>
      <button
        onClick={() => router.push('/dashboard/practice')}
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          background: 'var(--gradient-primary)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Back to Practice
      </button>
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
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Subjects</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#7B2FF7' }}>{subjects.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Answered</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{answered} / {totalQuestions}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Unanswered</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>{totalQuestions - answered}</span>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 28px', backgroundColor: '#0f172a', color: '#fff', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#64748b' }}>{exam} · Multi-Subject CBT</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{currentSubject}</div>
          </div>
        </div>

        {/* Subject Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSubjectSwitcher(!showSubjectSwitcher)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Grid3x3 size={16} />
            <span>Switch Subject ({currentSubjectIndex + 1}/{subjects.length})</span>
            <ChevronDown size={16} />
          </button>

          {showSubjectSwitcher && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              border: '1px solid var(--glass-border)',
              zIndex: 100,
              minWidth: '200px',
              padding: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>Select Subject</span>
                <button onClick={() => setShowSubjectSwitcher(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <X size={14} color="var(--color-text-muted)" />
                </button>
              </div>
              {(subjects || []).map((subject, index) => {
                const subjectQuestions = allQuestions[subject] || [];
                const subjectAnswered = subjectQuestions.filter(q => answers[q.id]).length;
                const isActive = currentSubject === subject;
                
                return (
                  <button
                    key={subject}
                    onClick={() => switchSubject(index)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(123, 47, 247, 0.08)' : 'transparent',
                      border: isActive ? '1px solid #7B2FF7' : '1px solid transparent',
                      color: isActive ? '#7B2FF7' : 'var(--color-text-main)',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                      textAlign: 'left'
                    }}
                  >
                    <span>{subject}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {subjectAnswered}/{subjectQuestions.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: isTimeLow ? '#dc2626' : '#1e293b', padding: '8px 18px', borderRadius: '10px', border: `1px solid ${isTimeLow ? '#ef4444' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.3s' }}>
          <Timer size={15} style={{ color: isTimeLow ? '#fff' : '#D97706' }} />
          <span style={{ fontSize: '16px', fontWeight: 800, color: isTimeLow ? '#fff' : '#D97706', fontVariantNumeric: 'tabular-nums', letterSpacing: '1px' }}>{formatTime(timeLeft)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px', borderRadius: '9px',
              background: showCalculator ? '#7B2FF7' : '#1e293b',
              color: '#fff', fontWeight: 700, fontSize: '13px',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Calculator size={15} /> Calculator
          </button>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#22c55e' }}>{answered}</div>
              <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Done</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#ef4444' }}>{totalQuestions - answered}</div>
              <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Left</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>{flagged.size}</div>
              <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Flagged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Question Section */}
        <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Question Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  backgroundColor: flagged.has(q.id) ? '#fef3c7' : '#f8fafc',
                  border: flagged.has(q.id) ? '2px solid #D97706' : '1px solid var(--glass-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: flagged.has(q.id) ? '#D97706' : '#7B2FF7' }}>
                    {currentQIndex + 1}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
                    Question {currentQIndex + 1} of {currentQuestions.length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {currentSubject}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleFlag}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '8px',
                  backgroundColor: flagged.has(q.id) ? '#fef3c7' : '#fff',
                  border: flagged.has(q.id) ? '1px solid #D97706' : '1px solid var(--glass-border)',
                  color: flagged.has(q.id) ? '#D97706' : 'var(--color-text-muted)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <Flag size={14} fill={flagged.has(q.id) ? '#D97706' : 'none'} />
                {flagged.has(q.id) ? 'Flagged' : 'Flag'}
              </button>
            </div>

            {/* Question Text */}
            <div style={{
              backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid var(--glass-border)',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--color-text-main)', fontWeight: 500 }}>
                {q.question}
              </p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(opts || []).map(([label, text]) => {
                const isSelected = answers[q.id] === label;
                return (
                  <button
                    key={label}
                    onClick={() => handleAnswerSelect(label)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '16px',
                      padding: '20px 24px', borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(123, 47, 247, 0.04)' : '#fff',
                      border: isSelected ? '2px solid #7B2FF7' : '1px solid var(--glass-border)',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      textAlign: 'left',
                      boxShadow: isSelected ? '0 4px 12px rgba(123, 47, 247, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      backgroundColor: isSelected ? '#7B2FF7' : '#f8fafc',
                      color: isSelected ? '#fff' : '#7B2FF7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 700, flexShrink: 0
                    }}>
                      {label}
                    </div>
                    <span style={{ fontSize: '15px', color: 'var(--color-text-main)', lineHeight: '1.6', fontWeight: 500 }}>
                      {text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div style={{ backgroundColor: '#fff', borderTop: '1px solid var(--glass-border)', padding: '16px 28px', flexShrink: 0 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button
                onClick={handlePrevious}
                disabled={currentQIndex === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '10px',
                  backgroundColor: currentQIndex === 0 ? '#f8fafc' : '#fff',
                  border: '1px solid var(--glass-border)',
                  color: currentQIndex === 0 ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                  fontSize: '14px', fontWeight: 600, cursor: currentQIndex === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <button
                onClick={() => setShowSubmitConfirm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '10px',
                  backgroundColor: '#16a34a', color: '#fff',
                  fontSize: '14px', fontWeight: 700, border: 'none',
                  cursor: 'pointer'
                }}
              >
                <CheckCheck size={16} />
                Submit Exam
              </button>

              <button
                onClick={handleNext}
                disabled={currentQIndex >= currentQuestions.length - 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '10px',
                  backgroundColor: currentQIndex >= currentQuestions.length - 1 ? '#f8fafc' : '#fff',
                  border: '1px solid var(--glass-border)',
                  color: currentQIndex >= currentQuestions.length - 1 ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                  fontSize: '14px', fontWeight: 600, cursor: currentQIndex >= currentQuestions.length - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Question Navigator */}
            <div style={{
              backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px',
              border: '1px solid var(--glass-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Question Navigator - {currentSubject}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {currentQuestions.filter(question => answers[question.id]).length} of {currentQuestions.length} answered
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(currentQuestions || []).map((question, index) => {
                  const isAnswered = answers[question.id];
                  const isFlagged = flagged.has(question.id);
                  const isCurrent = index === currentQIndex;
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => handleJumpToQuestion(index)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '8px',
                        backgroundColor: isCurrent ? '#7B2FF7' : isFlagged ? '#fef3c7' : isAnswered ? '#d1fae5' : '#fff',
                        border: isCurrent ? '2px solid #7B2FF7' : isFlagged ? '1px solid #D97706' : isAnswered ? '1px solid #16a34a' : '1px solid var(--glass-border)',
                        color: isCurrent ? '#fff' : isFlagged ? '#D97706' : isAnswered ? '#16a34a' : 'var(--color-text-main)',
                        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MultiSubjectExamPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading exam...</div>
    }>
      <MultiSubjectExamContent />
    </Suspense>
  );
}