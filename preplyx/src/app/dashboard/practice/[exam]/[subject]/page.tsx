"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Timer, ArrowLeft, ArrowRight, Flag, CheckCheck, BookOpen, AlertCircle } from 'lucide-react';
import { saveActiveSession, getActiveSession, clearActiveSession, saveCompletedSession } from '@/lib/storage';

const MOCK_QUESTIONS = [
  { id: 1, question: "Which of the following is NOT a factor that affects the rate of a chemical reaction?", option_a: "Temperature", option_b: "Concentration of reactants", option_c: "Color of reactants", option_d: "Surface area of reactants", correct_answer: "C", explanation: "The color of reactants does not affect the rate of a chemical reaction. The main factors that affect reaction rate are temperature, concentration, surface area, and catalysts." },
  { id: 2, question: "If 2x + 5 = 15, what is the value of x?", option_a: "5", option_b: "10", option_c: "15", option_d: "20", correct_answer: "A", explanation: "2x + 5 = 15 → 2x = 10 → x = 5. Subtract 5 from both sides then divide by 2." },
  { id: 3, question: "The capital of Nigeria is ________.", option_a: "Lagos", option_b: "Kano", option_c: "Abuja", option_d: "Port Harcourt", correct_answer: "C", explanation: "Abuja became the capital of Nigeria in 1991, replacing Lagos. It is located in the Federal Capital Territory (FCT)." },
  { id: 4, question: "Photosynthesis takes place in which part of a plant cell?", option_a: "Mitochondria", option_b: "Nucleus", option_c: "Ribosome", option_d: "Chloroplast", correct_answer: "D", explanation: "Photosynthesis occurs in the chloroplasts, which contain chlorophyll — the green pigment that captures sunlight to convert CO₂ and water into glucose and oxygen." },
  { id: 5, question: "Which gas is most abundant in the Earth's atmosphere?", option_a: "Oxygen", option_b: "Nitrogen", option_c: "Carbon Dioxide", option_d: "Argon", correct_answer: "B", explanation: "Nitrogen makes up approximately 78% of Earth's atmosphere, followed by Oxygen (21%), Argon (0.93%), and Carbon Dioxide (~0.04%)." },
];

function CBTContent({ params }: { params: Promise<{ exam: string, subject: string }> }) {
  const router = useRouter();
  const { exam, subject } = use(params);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

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
    saveActiveSession({ exam, subject, currentQIndex, answers, flagged: Array.from(flagged), timeLeft, lastAccessed: Date.now(), totalQ: MOCK_QUESTIONS.length });
  }, [currentQIndex, answers, flagged, timeLeft, exam, subject, sessionLoaded, isSubmitted]);

  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  });

  const formatTime = (s: number) => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const q = MOCK_QUESTIONS[currentQIndex];
  const opts: [string, string][] = [['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d]];
  const answered = Object.keys(answers).length;
  const isTimeLow = timeLeft < 300; // under 5 mins

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correct = MOCK_QUESTIONS.filter(q => answers[q.id] === q.correct_answer).length;
    const total = MOCK_QUESTIONS.length;
    const pct = Math.round((correct / total) * 100);
    const details = MOCK_QUESTIONS.map(q => ({ questionId: q.id, questionText: q.question, userAnswer: answers[q.id] || "Skipped", correctAnswer: q.correct_answer, isCorrect: answers[q.id] === q.correct_answer }));
    const sessionId = `${exam}-${subject}-${Date.now()}`;
    saveCompletedSession({ id: sessionId, exam, subject, score: correct, total, pct, date: Date.now(), timeSpentSeconds: 3600 - timeLeft, details });
    clearActiveSession();
    setTimeout(() => router.push(`/dashboard/result?id=${sessionId}`), 800);
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
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{answered} / {MOCK_QUESTIONS.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Unanswered</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>{MOCK_QUESTIONS.length - answered}</span>
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
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#94a3b8' }}>{MOCK_QUESTIONS.length - answered}</div>
              <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Left</div>
            </div>
          </div>
          <button onClick={() => setShowSubmitConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: '9px', background: 'var(--gradient-primary)', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px rgba(123,47,247,0.4)' }}>
            <CheckCheck size={15} /> Submit Exam
          </button>
        </div>
      </div>

      {/* Body: Question Only (no sidebar) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>

          {/* Question Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', align: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                Question {currentQIndex + 1} <span style={{ opacity: 0.6 }}>of {MOCK_QUESTIONS.length}</span>
              </span>
            </div>
            <button onClick={toggleFlag} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: flagged.has(q.id) ? '#D97706' : 'var(--color-text-muted)', background: flagged.has(q.id) ? '#FEF3C7' : '#f1f5f9', border: 'none', borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Flag size={13} fill={flagged.has(q.id) ? '#D97706' : 'none'} />
              {flagged.has(q.id) ? 'Flagged' : 'Flag for Review'}
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '28px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentQIndex + 1) / MOCK_QUESTIONS.length) * 100}%`, background: 'var(--gradient-primary)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>

          {/* Question Text */}
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '28px', border: '1px solid var(--glass-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', lineHeight: '1.75', margin: 0 }}>
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            {opts.map(([letter, text]) => {
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
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{currentQIndex + 1} / {MOCK_QUESTIONS.length}</span>
            {currentQIndex === MOCK_QUESTIONS.length - 1 ? (
              <button onClick={() => setShowSubmitConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '9px', border: 'none', background: 'var(--gradient-primary)', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 2px 12px rgba(123,47,247,0.4)', transition: 'all 0.15s' }}>
                <CheckCheck size={15} /> Submit
              </button>
            ) : (
              <button onClick={() => setCurrentQIndex(i => Math.min(MOCK_QUESTIONS.length - 1, i + 1))} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '9px', border: 'none', background: 'var(--gradient-primary)', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {MOCK_QUESTIONS.map((mq, idx) => {
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
