"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Bookmark, Filter, BookOpen, Eye, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function QuestionReview() {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'bookmarked'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [reviewedQuestions, setReviewedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchReviewedQuestions = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await api.getReviewedQuestions(token);
        setReviewedQuestions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reviewed questions');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewedQuestions();
  }, [token]);

  const filteredQuestions = (reviewedQuestions || []).filter((q) => {
    if (filter === 'all') return true;
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect;
    if (filter === 'bookmarked') return q.bookmarked;
    return true;
  });

  const stats = {
    total: (reviewedQuestions || []).length,
    correct: (reviewedQuestions || []).filter(q => q.isCorrect).length,
    incorrect: (reviewedQuestions || []).filter(q => !q.isCorrect).length,
    bookmarked: (reviewedQuestions || []).filter(q => q.bookmarked).length
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={20} color="#fff" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Loading Reviewed Questions...</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Fetching your question history</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={20} color="#dc2626" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>Error Loading Questions</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
          Question Review
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Review completed questions with explanations
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--glass-border)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#7B2FF7', marginBottom: '4px' }}>
            {stats.total}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Reviewed
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--glass-border)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
            {stats.correct}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Correct
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--glass-border)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>
            {stats.incorrect}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Incorrect
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--glass-border)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
            {stats.bookmarked}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Bookmarked
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All Questions', count: stats.total },
          { key: 'correct', label: 'Correct', count: stats.correct },
          { key: 'incorrect', label: 'Incorrect', count: stats.incorrect },
          { key: 'bookmarked', label: 'Bookmarked', count: stats.bookmarked },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: filter === item.key ? 'var(--gradient-primary)' : '#fff',
              color: filter === item.key ? '#fff' : 'var(--color-text-main)',
              fontSize: '13px',
              fontWeight: 600,
              border: filter === item.key ? 'none' : '1px solid var(--glass-border)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Filter size={14} />
            {item.label}
            {item.count > 0 && (
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '10px',
                backgroundColor: filter === item.key ? 'rgba(255,255,255,0.2)' : '#f8fafc',
                color: filter === item.key ? '#fff' : '#64748b'
              }}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)'
      }}>
        {filteredQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <BookOpen size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '8px' }}>No questions found</p>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>Complete some exams to review questions</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(filteredQuestions || []).map((question) => (
              <div
                key={question.id}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: selectedQuestion === question.id ? '#f8fafc' : '#fff',
                  border: selectedQuestion === question.id ? '2px solid #7B2FF7' : '1px solid var(--glass-border)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {question.isCorrect ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <XCircle size={20} color="#ef4444" />
                    )}
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: question.isCorrect ? '#dcfce7' : '#fee2e2',
                      color: question.isCorrect ? '#166534' : '#991b1b',
                      fontWeight: 600
                    }}>
                      {question.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: '#f8fafc',
                      color: '#64748b',
                      fontWeight: 500
                    }}>
                      {question.subject} · {question.exam}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {/* Toggle bookmark */}}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: question.bookmarked ? '#fef3c7' : '#f8fafc',
                        color: question.bookmarked ? '#f59e0b' : '#94a3b8',
                        border: '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Bookmark size={16} fill={question.bookmarked ? '#f59e0b' : 'none'} />
                    </button>
                    <button
                      onClick={() => setSelectedQuestion(selectedQuestion === question.id ? null : question.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '12px' }}>
                  {question.question}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '8px', marginBottom: '12px' }}>
                  {(question.options || []).map((option) => (
                    <div
                      key={option}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: option === question.correctAnswer 
                          ? '#dcfce7' 
                          : option === question.userAnswer && option !== question.correctAnswer 
                            ? '#fee2e2' 
                            : '#f8fafc',
                        border: option === question.correctAnswer 
                          ? '1px solid #bbf7d0' 
                          : option === question.userAnswer && option !== question.correctAnswer 
                            ? '1px solid #fecaca' 
                            : '1px solid var(--glass-border)',
                        fontSize: '13px',
                        fontWeight: option === question.correctAnswer ? 600 : 400,
                        color: option === question.correctAnswer 
                          ? '#166534' 
                          : option === question.userAnswer && option !== question.correctAnswer 
                            ? '#991b1b' 
                            : '#64748b'
                      }}
                    >
                      {option}
                      {option === question.correctAnswer && ' ✓'}
                      {option === question.userAnswer && option !== question.correctAnswer && ' ✗'}
                    </div>
                  ))}
                </div>

                {selectedQuestion === question.id && (
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    marginTop: '12px'
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#166534', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Explanation
                    </p>
                    <p style={{ fontSize: '13px', color: '#166534', lineHeight: '1.6' }}>
                      {question.explanation}
                    </p>
                  </div>
                )}

                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>
                  Reviewed on {question.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)',
        marginTop: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
          Search Questions
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by question, subject, or keyword..."
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
          <button style={{
            padding: '12px 24px',
            borderRadius: '8px',
            background: 'var(--gradient-primary)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
