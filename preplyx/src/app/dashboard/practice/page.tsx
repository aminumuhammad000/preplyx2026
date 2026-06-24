"use client";
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, BookOpen, Clock, BarChart2, CheckCircle2, Star, Zap, Calculator, BookType, FlaskConical, Leaf, BarChart3, Landmark, Vote, Sprout, BookText, Briefcase, ShoppingCart, Globe, Scroll, Monitor, Music, Palette, Activity, Shield, Users, Apple, Shirt, Home, PenTool, Hammer, Cpu, Wrench, Keyboard, Pen, TrendingUp, Play, Building2, Cross, Book } from 'lucide-react';
import { api } from '@/lib/api';

interface ExamData {
  subjects: string[];
  color: string;
  years: string;
  desc: string;
}

const CATEGORIES = ['All', 'Science', 'Art', 'Commerce', 'Vocational', 'Language'] as const;
type Category = typeof CATEGORIES[number];

// Icon mapping from server icon names to Lucide components
const ICON_MAP: Record<string, any> = {
  Calculator,
  BookType,
  Zap,
  FlaskConical,
  Leaf,
  BarChart3,
  Landmark,
  Vote,
  Sprout,
  BookText,
  Briefcase,
  ShoppingCart,
  Globe,
  Scroll,
  Cross,
  Building2,
  Monitor,
  Music,
  Palette,
  Activity,
  Shield,
  Users,
  Apple,
  Shirt,
  Home,
  PenTool,
  Hammer,
  Cpu,
  Wrench,
  Keyboard,
  Pen,
  TrendingUp,
  Play,
  Book
};

function getIconComponent(iconName: string): any {
  return ICON_MAP[iconName] || BookOpen;
}

function PracticeSelection() {
  const searchParams = useSearchParams();
  const [examData, setExamData] = useState<Record<string, ExamData>>({});
  const [subjectCategories, setSubjectCategories] = useState<Record<string, Category[]>>({});
  const [subjectIcons, setSubjectIcons] = useState<Record<string, string>>({});
  const [subjectTips, setSubjectTips] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryExam = searchParams.get('exam');
  const initialExam = queryExam || 'JAMB';
  const [selectedExam, setSelectedExam] = useState<string>(initialExam);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState<number>(1); // Default 1 hour

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [exams, categories, icons, tips] = await Promise.all([
          api.getExams(),
          api.getSubjectCategories(),
          api.getSubjectIcons(),
          api.getSubjectTips()
        ]);
        
        setExamData(exams);
        setSubjectCategories(categories);
        setSubjectIcons(icons);
        setSubjectTips(tips);
        
        // Validate initial exam
        if (queryExam && !exams[queryExam]) {
          setSelectedExam('JAMB');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch exam data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [queryExam]);

  const exam = examData[selectedExam] || examData['JAMB'] || { subjects: [], color: '#4B0FA3', years: '', desc: '' };
  const filteredSubjects = (exam.subjects || []).filter(subject => 
    selectedCategory === 'All' || (subjectCategories[subject] || []).includes(selectedCategory)
  );

  const toggleSubjectSelection = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleStartExam = () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }
    // Navigate to the exam page with selected subjects and custom time
    // This will be implemented after we create the multi-subject exam interface
    const examParams = new URLSearchParams();
    examParams.set('exam', selectedExam);
    examParams.set('subjects', selectedSubjects.join(','));
    examParams.set('time', (customTime * 3600).toString()); // Convert hours to seconds
    window.location.href = `/dashboard/multi-subject-exam?${examParams.toString()}`;
  };

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

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Loading Exam Data...</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Fetching available exams</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', borderRadius: '12px', marginBottom: '28px' }}>
          <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: 600 }}>Error: {error}</div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Quick Stats Banner */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '20px', marginBottom: '28px', padding: '24px',
            borderRadius: '16px', background: 'var(--gradient-primary)', color: '#fff',
            boxShadow: '0 8px 24px rgba(123, 47, 247, 0.2)'
          }}>
            {[
              { icon: BookOpen, label: 'Total Subjects', value: (exam.subjects || []).length.toString() },
              { icon: Clock, label: 'Time Per Exam', value: '1-10 hrs' },
              { icon: BarChart2, label: 'Years Available', value: '20+' },
              { icon: CheckCircle2, label: 'Questions/Session', value: '5–60' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
                className="practice-stat-item"
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>{value}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: 500 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Exam Selector Tabs */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Select Exam Type</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
              {Object.entries(examData || {}).map(([examKey, data]) => {
                const isActive = selectedExam === examKey;
                return (
                  <button
                    key={examKey}
                    onClick={() => setSelectedExam(examKey)}
                    style={{
                      padding: '20px', borderRadius: '16px', textAlign: 'left',
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
              Select multiple subjects to start your practice session.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFF9E6', padding: '6px 14px', borderRadius: '20px' }}>
              <Zap size={12} color="#D97706" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#D97706' }}>{filteredSubjects.length} Available</span>
            </div>
            {selectedSubjects.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#D1FAE5', padding: '6px 14px', borderRadius: '20px' }}>
                <CheckCircle2 size={12} color="#059669" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>{selectedSubjects.length} Selected</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
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
          {(filteredSubjects || []).map((subject) => {
            const isSelected = selectedSubjects.includes(subject);
            const IconComp = getIconComponent(subjectIcons[subject] || 'Book');
            const tip = subjectTips[subject] || '';
            return (
              <div
                key={subject}
                onClick={() => toggleSubjectSelection(subject)}
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  padding: '20px', borderRadius: '14px',
                  backgroundColor: isSelected ? `${exam.color}08` : '#fff', 
                  border: isSelected ? `2px solid ${exam.color}` : '1px solid var(--glass-border)',
                  boxShadow: isSelected ? `0 4px 12px ${exam.color}15` : '0 2px 8px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '120px',
                  position: 'relative'
                }}
                className="subject-card-pro"
              >
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    border: isSelected ? `2px solid ${exam.color}` : '2px solid var(--glass-border)',
                    backgroundColor: isSelected ? exam.color : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isSelected && <CheckCircle2 size={14} color="#fff" />}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '10px', backgroundColor: `${exam.color}15`, color: exam.color, marginBottom: '14px' }}>
                    <IconComp size={22} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>{subject}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{tip}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3].map(s => <Star key={s} size={10} color="#F5B700" fill="#F5B700" />)}
                    {[4,5].map(s => <Star key={s} size={10} color="#e2e8f0" fill="#e2e8f0" />)}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: exam.color }}>
                    {isSelected ? 'Selected' : 'Select'} <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Time Setting and Start Button */}
      {selectedSubjects.length > 0 && (
        <div style={{
          marginTop: '28px',
          padding: '24px',
          borderRadius: '16px',
          backgroundColor: '#fff',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
              Exam Settings
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  Set Your Time Limit
                </label>
                <span style={{ fontSize: '18px', fontWeight: 800, color: exam.color }}>
                  {customTime} {customTime === 1 ? 'hour' : 'hours'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={customTime}
                onChange={(e) => setCustomTime(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, ${exam.color} 0%, ${exam.color} ${(customTime - 1) * 11.11}%, var(--glass-border) ${(customTime - 1) * 11.11}%, var(--glass-border) 100%)`,
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(hour => (
                  <span key={hour} style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{hour}h</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleStartExam}
                style={{
                  flex: '1 1 200px',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  background: 'var(--gradient-primary)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Play size={18} />
                Start Exam ({selectedSubjects.length} subjects)
              </button>
              <button
                onClick={() => setSelectedSubjects([])}
                style={{
                  flex: '1 1 120px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  color: 'var(--color-text-muted)',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </>
      )}
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
