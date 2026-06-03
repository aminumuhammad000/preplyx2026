"use client";
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, BookOpen, Clock, BarChart2, CheckCircle2, Star, Zap, Calculator, BookType, FlaskConical, Leaf, BarChart3, Landmark, Vote, Sprout, BookText, Briefcase, ShoppingCart } from 'lucide-react';

const EXAM_DATA: Record<string, { subjects: string[]; color: string; years: string; desc: string }> = {
  JAMB: {
    subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature', 'Accounting', 'Commerce'],
    color: '#4B0FA3',
    years: '2004 – 2024',
    desc: 'Joint Admissions and Matriculation Board'
  },
  WAEC: {
    subjects: ['Mathematics', 'English', 'Biology', 'Economics', 'Physics', 'Chemistry', 'Civic Education', 'Literature', 'Accounting', 'Commerce'],
    color: '#7B2FF7',
    years: '2000 – 2024',
    desc: 'West African Examinations Council'
  },
  NECO: {
    subjects: ['Mathematics', 'English', 'Biology', 'Economics', 'Physics', 'Chemistry', 'Agricultural Science', 'Government', 'Accounting', 'Commerce'],
    color: '#4B0FA3',
    years: '2003 – 2024',
    desc: 'National Examinations Council'
  },
};

const CATEGORIES = ['All', 'Science', 'Art', 'Commerce'] as const;
type Category = typeof CATEGORIES[number];

const SUBJECT_CATEGORIES: Record<string, Category[]> = {
  'Mathematics': ['Science', 'Art', 'Commerce'],
  'English': ['Science', 'Art', 'Commerce'],
  'Physics': ['Science'],
  'Chemistry': ['Science'],
  'Biology': ['Science'],
  'Agricultural Science': ['Science'],
  'Economics': ['Commerce', 'Art'],
  'Government': ['Art'],
  'Civic Education': ['Art', 'Commerce'],
  'Literature': ['Art'],
  'Accounting': ['Commerce'],
  'Commerce': ['Commerce']
};

const SUBJECT_ICONS: Record<string, any> = {
  Mathematics: Calculator,
  English: BookType,
  Physics: Zap,
  Chemistry: FlaskConical,
  Biology: Leaf,
  Economics: BarChart3,
  Government: Landmark,
  'Civic Education': Vote,
  'Agricultural Science': Sprout,
  Literature: BookText,
  Accounting: Briefcase,
  Commerce: ShoppingCart,
};

const SUBJECT_TIPS: Record<string, string> = {
  Mathematics: 'Algebra, Sequences, Statistics',
  English: 'Comprehension, Grammar, Vocabulary',
  Physics: 'Mechanics, Waves, Electromagnetism',
  Chemistry: 'Organic, Inorganic, Physical Chem',
  Biology: 'Genetics, Ecology, Cell Biology',
  Economics: 'Micro, Macro, Trade & Policy',
  Government: 'Constitution, Governance, Politics',
  'Civic Education': 'Rights, Duties, Citizenship',
  'Agricultural Science': 'Crops, Livestock, Soil Science',
  Literature: 'Prose, Poetry, Drama, Figures of Speech',
  Accounting: 'Ledgers, Balance Sheets, Financials',
  Commerce: 'Trade, Finance, Business Organizations',
};

function PracticeSelection() {
  const searchParams = useSearchParams();
  const initialExam = (searchParams.get('exam') || 'JAMB') as keyof typeof EXAM_DATA;
  const [selectedExam, setSelectedExam] = useState<keyof typeof EXAM_DATA>(initialExam);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const exam = EXAM_DATA[selectedExam];
  const filteredSubjects = exam.subjects.filter(subject => 
    selectedCategory === 'All' || (SUBJECT_CATEGORIES[subject] || []).includes(selectedCategory)
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingBottom: '40px' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          CBT Practice
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Choose your exam type and subject to start a timed computer-based test simulation.
        </p>
      </div>

      {/* Quick Stats Banner */}
      <div style={{
        display: 'flex', gap: '16px', marginBottom: '28px', padding: '18px 24px',
        borderRadius: '14px', background: 'var(--gradient-primary)', color: '#fff'
      }}>
        {[
          { icon: BookOpen, label: 'Total Subjects', value: '21' },
          { icon: Clock, label: 'Time Per Exam', value: '60 mins' },
          { icon: BarChart2, label: 'Years Available', value: '20+' },
          { icon: CheckCircle2, label: 'Questions/Session', value: '5–60' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', borderRight: '1px solid rgba(255,255,255,0.12)' }}
            className="practice-stat-item"
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '2px', fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Exam Selector Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Select Exam Type</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          {Object.entries(EXAM_DATA).map(([examKey, data]) => {
            const isActive = selectedExam === examKey;
            return (
              <button
                key={examKey}
                onClick={() => setSelectedExam(examKey as keyof typeof EXAM_DATA)}
                style={{
                  flex: 1, padding: '16px 20px', borderRadius: '12px', textAlign: 'left',
                  border: isActive ? `2px solid ${data.color}` : '1px solid var(--glass-border)',
                  backgroundColor: isActive ? 'rgba(75,15,163,0.04)' : '#fff',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 0 0 4px rgba(75,15,163,0.08)` : '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: isActive ? data.color : 'var(--color-text-main)', marginBottom: '4px' }}>{examKey}</div>
                  {isActive && (
                    <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: data.color, color: '#fff', padding: '3px 8px', borderRadius: '20px' }}>Active</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>{data.desc}</div>
                <div style={{ fontSize: '11px', color: isActive ? data.color : 'var(--color-text-muted)', fontWeight: 600 }}>
                  {data.subjects.length} subjects · {data.years}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              {selectedExam} Subjects
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Pick a subject to start your practice session.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFF9E6', padding: '6px 14px', borderRadius: '20px' }}>
            <Zap size={12} color="#D97706" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#D97706' }}>{filteredSubjects.length} Available</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '24px',
                fontSize: '13px',
                fontWeight: 700,
                border: selectedCategory === cat ? `1px solid ${exam.color}` : '1px solid var(--glass-border)',
                backgroundColor: selectedCategory === cat ? `${exam.color}12` : '#fff',
                color: selectedCategory === cat ? exam.color : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                boxShadow: selectedCategory === cat ? `0 2px 8px ${exam.color}20` : '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              {cat === 'All' ? 'All Subjects' : `${cat} Class`}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {filteredSubjects.map((subject) => (
            <Link
              key={subject}
              href={`/dashboard/practice/${selectedExam.toLowerCase()}/${subject.toLowerCase()}`}
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '20px', borderRadius: '14px',
                backgroundColor: '#fff', border: '1px solid var(--glass-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                minHeight: '120px'
              }}
              className="subject-card-pro"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '10px', backgroundColor: `${exam.color}15`, color: exam.color, marginBottom: '14px' }}>
                  {(() => {
                    const IconComp = SUBJECT_ICONS[subject] || BookOpen;
                    return <IconComp size={22} />;
                  })()}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>{subject}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{SUBJECT_TIPS[subject]}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1,2,3].map(s => <Star key={s} size={10} color="#F5B700" fill="#F5B700" />)}
                  {[4,5].map(s => <Star key={s} size={10} color="#e2e8f0" fill="#e2e8f0" />)}
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: exam.color }}>
                  Start <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading practice...</div>
    }>
      <PracticeSelection />
    </Suspense>
  );
}
