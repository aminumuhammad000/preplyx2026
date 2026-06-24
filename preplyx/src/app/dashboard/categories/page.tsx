"use client";
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, FileText, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const ICON_MAP: Record<string, any> = {
  BookOpen,
  GraduationCap,
  FileText,
};

export default function ExamCategories() {
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const data = await api.getExams();
        
        // Transform the data into the format expected by the UI
        const transformedExams = Object.entries(data || {}).map(([key, exam]: [string, any]) => ({
          id: key.toLowerCase(),
          name: exam.displayName || key,
          description: exam.desc,
          subjects: exam.subjects,
          years: exam.years,
          color: exam.color,
          icon: BookOpen, // Default icon, can be enhanced later
          questions: exam.questionCount || '0'
        }));
        
        setExamTypes(transformedExams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch exam data');
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <BookOpen size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: '#94a3b8' }}>Loading exam categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: '#ef4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
          Exam Categories
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Select your exam type and choose subjects to start practicing
        </p>
      </div>

      {/* Exam Type Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', marginBottom: '32px' }}>
        {(examTypes || []).map((exam) => (
          <Link
            key={exam.id}
            href={`/dashboard/practice?exam=${exam.id}`}
            style={{
              textDecoration: 'none',
              backgroundColor: `${exam.color}06`,
              borderRadius: '20px',
              padding: '24px',
              boxShadow: `0 4px 20px ${exam.color}10`,
              border: `1px solid ${exam.color}20`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'block',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="exam-category-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: exam.color, marginBottom: '4px' }}>
                  {exam.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {exam.description}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: `${exam.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <exam.icon size={24} color={exam.color} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Questions
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {exam.questions}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Years
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {exam.years}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Subjects
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {exam.subjects.length}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {(exam.subjects || []).slice(0, 4).map((subject) => (
                <span
                  key={subject}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: `${exam.color}10`,
                    color: exam.color,
                    fontWeight: 500
                  }}
                >
                  {subject}
                </span>
              ))}
              {exam.subjects.length > 4 && (
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  +{exam.subjects.length - 4} more
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: exam.color, fontWeight: 600, fontSize: '13px' }}>
              Start Practice <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      {/* Subject Selection Guide */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
          How to Get Started
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#7B2FF7',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}>
              1
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                Select Exam Type
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Choose from JAMB, WAEC, NECO, or Post UTME
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#7B2FF7',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}>
              2
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                Choose Subjects
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Pick the subjects you want to practice
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#7B2FF7',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}>
              3
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                Start Practice
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Begin answering questions and track progress
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .exam-category-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }
      `}</style>
    </div>
  );
}
