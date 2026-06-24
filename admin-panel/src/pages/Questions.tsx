import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileQuestion, Scan, Search, Plus, Pencil, Trash2, CheckCircle, XCircle, X,
  Loader, AlertTriangle, UploadCloud, CheckCircle2, ChevronLeft, ChevronRight, BookOpen, GraduationCap,
  Lightbulb
} from 'lucide-react';
import './Questions.css';

/* ── Config ── */
const API_BASE_URL = 'http://localhost:5000/api';

/* ── Types ── */
interface QuestionData {
  _id: string;
  exam: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface FormData {
  exam: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

type ToastState = { message: string; type: 'success' | 'error' } | null;

const EMPTY_FORM: FormData = {
  exam: 'JAMB',
  subject: '',
  text: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: ''
};

export const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [search, setSearch] = useState('');
  const [filterExam, setFilterExam] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');

  // Manual Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null);
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  // Scanner Modal
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanState, setScanState] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [scannedResults, setScannedResults] = useState<QuestionData[]>([]);
  const [savingScanned, setSavingScanned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV Importer Modal
  const [importerOpen, setImporterOpen] = useState(false);
  const [importerState, setImporterState] = useState<'upload' | 'review'>('upload');
  const [importedResults, setImportedResults] = useState<QuestionData[]>([]);
  const [savingImported, setSavingImported] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<QuestionData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pre-load subjects for dropdown (mocked for UI, ideally fetched)
  const availableExams = ['All', 'JAMB', 'WAEC', 'NECO', 'POST-UTME'];
  const availableSubjects = ['All', 'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology'];

  /* ── Fetch Questions ── */
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: '15',
        exam: filterExam,
        subject: filterSubject,
        search
      });
      const res = await fetch(`${API_BASE_URL}/admin/questions?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setTotalPages(data.totalPages || 1);
        setTotalQuestions(data.total || 0);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filterExam, filterSubject, search]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchQuestions(); }, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchQuestions, search]);

  /* ── Toast ── */
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Manual Drawer Logic ── */
  const openCreateDrawer = () => {
    setForm({ ...EMPTY_FORM });
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (q: QuestionData) => {
    setForm({
      exam: q.exam,
      subject: q.subject,
      text: q.text,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ''
    });
    setEditingQuestion(q);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingQuestion(null);
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOpts = [...form.options];
    newOpts[index] = val;
    
    // If the changed option was the correct answer, update it if it matched exactly
    const isCorrect = form.options[index] === form.correctAnswer && form.correctAnswer !== '';
    setForm(f => ({ ...f, options: newOpts, correctAnswer: isCorrect ? val : f.correctAnswer }));
  };

  const setCorrectOption = (index: number) => {
    setForm(f => ({ ...f, correctAnswer: f.options[index] }));
  };

  const handleSubmit = async () => {
    if (!form.exam || !form.subject || !form.text || form.options.some(o => !o.trim()) || !form.correctAnswer) {
      showToast('Please fill all required fields and options completely.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const isCreate = drawerMode === 'create';
      const url = isCreate ? `${API_BASE_URL}/admin/questions` : `${API_BASE_URL}/admin/questions/${editingQuestion?._id}`;
      
      const res = await fetch(url, {
        method: isCreate ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        showToast(`Question ${isCreate ? 'created' : 'updated'} successfully`, 'success');
        closeDrawer();
        fetchQuestions();
      } else {
        showToast('Failed to save question', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete Logic ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/questions/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Question deleted', 'success');
        fetchQuestions();
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* ── Scanner Modal Logic ── */
  const openScanner = () => {
    setScanState('upload');
    setScannedResults([]);
    setScannerOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Simulate file read and upload
      setScanState('scanning');
      
      try {
        const res = await fetch(`${API_BASE_URL}/admin/questions/scan`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setScannedResults(data.questions);
          setScanState('review');
        } else {
          showToast('Failed to process image', 'error');
          setScanState('upload');
        }
      } catch {
        showToast('Network error connecting to AI OCR service', 'error');
        setScanState('upload');
      }
    }
  };

  const removeScanned = (idx: number) => {
    setScannedResults(prev => prev.filter((_, i) => i !== idx));
  };

  const saveScannedQuestions = async () => {
    if (scannedResults.length === 0) return;
    setSavingScanned(true);

    try {
      // Create questions sequentially or in parallel
      await Promise.all(scannedResults.map(q => 
        fetch(`${API_BASE_URL}/admin/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...q,
            exam: filterExam === 'All' ? 'JAMB' : filterExam,
            subject: filterSubject === 'All' ? 'Mathematics' : filterSubject
          })
        })
      ));
      showToast(`${scannedResults.length} questions saved to bank!`, 'success');
      setScannerOpen(false);
      fetchQuestions();
    } catch {
      showToast('Error saving scanned questions', 'error');
    } finally {
      setSavingScanned(false);
    }
  };

  /* ── CSV Importer Logic ── */
  const openImporter = () => {
    setImporterState('upload');
    setImportedResults([]);
    setImporterOpen(true);
  };

  const parseCSVRow = (rowText: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.replace(/^"|"$/g, '').trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.replace(/^"|"$/g, '').trim());
    return result;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv') {
        showToast('Please upload a valid CSV file.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) {
            showToast('File is empty', 'error');
            return;
          }

          const lines = text.split(/\r?\n/);
          if (lines.length < 2) {
            showToast('No questions found in CSV', 'error');
            return;
          }

          // Parse headers
          const headers = parseCSVRow(lines[0]);
          const textIdx = headers.findIndex(h => h.match(/question|text/i));
          const optAIdx = headers.findIndex(h => h.match(/option_?a|opt_?a/i));
          const optBIdx = headers.findIndex(h => h.match(/option_?b|opt_?b/i));
          const optCIdx = headers.findIndex(h => h.match(/option_?c|opt_?c/i));
          const optDIdx = headers.findIndex(h => h.match(/option_?d|opt_?d/i));
          const correctIdx = headers.findIndex(h => h.match(/correct|answer/i));
          const examIdx = headers.findIndex(h => h.match(/exam/i));
          const subjectIdx = headers.findIndex(h => h.match(/subject/i));
          const explanationIdx = headers.findIndex(h => h.match(/explanation/i));

          if (textIdx === -1 || optAIdx === -1 || optBIdx === -1 || optCIdx === -1 || optDIdx === -1 || correctIdx === -1) {
            showToast('CSV must include columns: text/question, option_a, option_b, option_c, option_d, and correct_answer.', 'error');
            return;
          }

          const results: any[] = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = parseCSVRow(line);
            if (cols.length < 5) continue;

            const qText = cols[textIdx]?.trim();
            const optA = cols[optAIdx]?.trim();
            const optB = cols[optBIdx]?.trim();
            const optC = cols[optCIdx]?.trim();
            const optD = cols[optDIdx]?.trim();
            const correctAnsRaw = cols[correctIdx]?.trim();
            const explanation = explanationIdx !== -1 ? cols[explanationIdx]?.trim() : '';

            if (!qText || !optA || !optB || !optC || !optD || !correctAnsRaw) continue;

            let correctAnswer = '';
            const upperAns = correctAnsRaw.toUpperCase();
            if (upperAns === 'A') correctAnswer = optA;
            else if (upperAns === 'B') correctAnswer = optB;
            else if (upperAns === 'C') correctAnswer = optC;
            else if (upperAns === 'D') correctAnswer = optD;
            else correctAnswer = correctAnsRaw;

            results.push({
              exam: examIdx !== -1 && cols[examIdx] ? cols[examIdx].trim() : (filterExam === 'All' ? 'JAMB' : filterExam),
              subject: subjectIdx !== -1 && cols[subjectIdx] ? cols[subjectIdx].trim() : (filterSubject === 'All' ? 'Mathematics' : filterSubject),
              text: qText,
              options: [optA, optB, optC, optD],
              correctAnswer,
              explanation
            });
          }

          if (results.length === 0) {
            showToast('No valid questions parsed from CSV.', 'error');
            return;
          }

          setImportedResults(results);
          setImporterState('review');
        } catch {
          showToast('Failed to parse CSV file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const removeImported = (idx: number) => {
    setImportedResults(prev => prev.filter((_, i) => i !== idx));
  };

  const saveImportedQuestions = async () => {
    if (importedResults.length === 0) return;
    setSavingImported(true);

    try {
      await Promise.all(importedResults.map(q => 
        fetch(`${API_BASE_URL}/admin/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(q)
        })
      ));
      showToast(`${importedResults.length} questions imported successfully!`, 'success');
      setImporterOpen(false);
      fetchQuestions();
    } catch {
      showToast('Error importing questions', 'error');
    } finally {
      setSavingImported(false);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = 'exam,subject,text,option_a,option_b,option_c,option_d,correct_answer,explanation\n';
    const row1 = 'JAMB,Mathematics,"Solve for x: 3x - 9 = 0",1,2,3,4,3,3x = 9 -> x = 3\n';
    const row2 = 'WAEC,English Language,"Choose the correct synonym for \'Happy\'",sad,joyful,angry,tired,joyful,Joyful is a synonym for happy\n';
    
    const blob = new Blob([headers + row1 + row2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'question_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="qb-page">

      {/* ───── HERO ───── */}
      <div className="qb-hero">
        <div className="qb-hero-left">
          <div className="qb-hero-eyebrow">
            <FileQuestion size={12} /> Database
          </div>
          <h1>Question Bank</h1>
          <p className="qb-hero-sub">
            Manage your centralized repository of examination questions. Manually author content or instantly scan past papers using AI.
          </p>
        </div>
        <div className="qb-hero-right">
          <button className="qb-btn-secondary" onClick={openImporter}>
            <UploadCloud size={15} /> Import CSV
          </button>
          <button className="qb-btn-secondary" onClick={openScanner}>
            <Scan size={15} /> Scan Paper
          </button>
          <button className="qb-btn-primary" onClick={openCreateDrawer}>
            <Plus size={15} /> Create Question
          </button>
        </div>
      </div>

      {/* ───── TOOLBAR ───── */}
      <div className="qb-toolbar">
        <div className="qb-search-wrap">
          <Search size={15} color="#9ca3af" />
          <input
            placeholder="Search questions by text…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && <X size={14} color="#9ca3af" style={{cursor: 'pointer'}} onClick={() => {setSearch(''); setPage(1);}} />}
        </div>
        <div className="qb-filters">
          <div className="qb-select-wrap">
            <GraduationCap size={15} color="#6b7280" />
            <select value={filterExam} onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}>
              {availableExams.map(ex => <option key={ex} value={ex}>{ex === 'All' ? 'All Exams' : ex}</option>)}
            </select>
          </div>
          <div className="qb-select-wrap">
            <BookOpen size={15} color="#6b7280" />
            <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setPage(1); }}>
              {availableSubjects.map(sub => <option key={sub} value={sub}>{sub === 'All' ? 'All Subjects' : sub}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ───── LIST ───── */}
      <div className="qb-list">
        {loading ? (
          Array.from({length: 4}).map((_, i) => (
            <div key={i} className="qb-skeleton-card sm-shimmer"></div>
          ))
        ) : questions.length === 0 ? (
          <div className="qb-empty">
            <div className="qb-empty-icon"><FileQuestion size={32} /></div>
            <h3>No questions found</h3>
            <p>Try adjusting your search filters or add new questions to the bank.</p>
          </div>
        ) : (
          questions.map(q => (
            <div className="qb-item-card" key={q._id}>
              <div className="qb-item-header">
                <div className="qb-item-tags">
                  <span className="qb-tag qb-tag-exam">{q.exam}</span>
                  <span className="qb-tag qb-tag-subject">{q.subject}</span>
                </div>
                <div className="qb-item-actions">
                  <button className="qb-action-icon" onClick={() => openEditDrawer(q)} title="Edit Question">
                    <Pencil size={15} />
                  </button>
                  <button className="qb-action-icon delete" onClick={() => setDeleteTarget(q)} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="qb-item-text">{q.text}</div>

              <div className="qb-item-options">
                {q.options.map((opt, i) => {
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <div key={i} className={`qb-option ${isCorrect ? 'is-correct' : ''}`}>
                      <div className="font-bold">{['A', 'B', 'C', 'D'][i]}.</div>
                      <div style={{ flex: 1 }}>{opt}</div>
                      {isCorrect && <CheckCircle2 size={16} />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="qb-item-explanation">
                  <Lightbulb size={16} />
                  <div><strong>Explanation:</strong> {q.explanation}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ───── PAGINATION ───── */}
      {!loading && totalPages > 1 && (
        <div className="qb-pagination">
          <div className="qb-page-info">
            Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, totalQuestions)} of {totalQuestions} questions
          </div>
          <div className="qb-page-controls">
            <button className="qb-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            <button className="qb-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          MANUAL CREATION DRAWER
      ═══════════════════════════════════ */}
      {drawerOpen && (
        <>
          <div className="qb-drawer-backdrop" onClick={closeDrawer} />
          <div className="qb-drawer">
            <div className="qb-drawer-accent" />
            <div className="qb-drawer-header">
              <div className="qb-drawer-title">{drawerMode === 'create' ? 'Create Question' : 'Edit Question'}</div>
              <button className="qb-drawer-close" onClick={closeDrawer}><X size={16} /></button>
            </div>
            
            <div className="qb-drawer-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="qb-field">
                  <label className="qb-field-label">Exam Type *</label>
                  <select className="qb-select" value={form.exam} onChange={e => setForm(f => ({...f, exam: e.target.value}))}>
                    {availableExams.filter(e => e !== 'All').map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="qb-field">
                  <label className="qb-field-label">Subject *</label>
                  <input className="qb-input" placeholder="e.g. Mathematics" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} />
                </div>
              </div>

              <div className="qb-field">
                <label className="qb-field-label">Question Text *</label>
                <textarea className="qb-textarea" placeholder="Enter the full question text here..." value={form.text} onChange={e => setForm(f => ({...f, text: e.target.value}))} />
              </div>

              <div className="qb-field">
                <label className="qb-field-label">Options & Correct Answer *</label>
                <div className="qb-options-grid">
                  {form.options.map((opt, i) => {
                    const letter = ['A', 'B', 'C', 'D'][i];
                    const isCorrect = form.correctAnswer === opt && opt !== '';
                    return (
                      <div key={i} className="qb-option-row">
                        <div 
                          className={`qb-radio-wrap ${isCorrect ? 'selected' : ''}`}
                          onClick={() => setCorrectOption(i)}
                          title="Click to mark as correct answer"
                        >
                          {letter}
                        </div>
                        <input 
                          className="qb-input" 
                          placeholder={`Option ${letter}`} 
                          value={opt} 
                          onChange={e => handleOptionChange(i, e.target.value)} 
                        />
                      </div>
                    );
                  })}
                </div>
                <p style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
                  Click the A/B/C/D button next to an option to mark it as the correct answer.
                </p>
              </div>

              <div className="qb-field">
                <label className="qb-field-label">Explanation (Optional)</label>
                <textarea className="qb-textarea" style={{minHeight: '80px'}} placeholder="Explain why the answer is correct..." value={form.explanation} onChange={e => setForm(f => ({...f, explanation: e.target.value}))} />
              </div>
            </div>

            <div className="qb-drawer-footer">
              <button className="qb-btn-submit" disabled={submitting} onClick={handleSubmit}>
                {submitting ? <Loader size={16} className="qb-spin" /> : <CheckCircle size={16} />}
                {drawerMode === 'create' ? 'Save Question' : 'Update Question'}
              </button>
              <button className="qb-btn-cancel" onClick={closeDrawer}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════
          AI OCR SCANNER MODAL
      ═══════════════════════════════════ */}
      {scannerOpen && (
        <div className="qb-scanner-overlay" onClick={() => scanState === 'upload' && setScannerOpen(false)}>
          <div className="qb-scanner-card" onClick={e => e.stopPropagation()}>
            
            <div className="qb-scanner-header">
              <h2>Smart Paper Scanner</h2>
              <p>Upload a past question paper. AI will extract and format the questions automatically.</p>
              {scanState !== 'scanning' && (
                <button className="qb-scanner-close" onClick={() => setScannerOpen(false)}><X size={16} /></button>
              )}
            </div>

            <div className="qb-scanner-body">
              {scanState === 'upload' && (
                <div className="qb-upload-zone" onClick={() => fileInputRef.current?.click()}>
                  <div className="qb-upload-icon"><UploadCloud size={32} /></div>
                  <h3>Click or drag image to scan</h3>
                  <p>Supports JPG, PNG, PDF. High resolution yields better extraction.</p>
                  <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={handleFileUpload} />
                </div>
              )}

              {scanState === 'scanning' && (
                <div className="qb-scanning-state">
                  <div className="qb-scan-anim">
                    <div className="qb-scan-line"></div>
                    <img src="https://via.placeholder.com/120x160/f8fafc/cbd5e1?text=Doc" alt="Document" style={{opacity: 0.5}} />
                  </div>
                  <h3>AI is analyzing the document...</h3>
                  <p>Running Optical Character Recognition and parsing options.</p>
                </div>
              )}

              {scanState === 'review' && (
                <div className="qb-preview-container">
                  <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3 style={{fontSize: '16px', fontWeight: 700}}>Review Extracted Questions ({scannedResults.length})</h3>
                    <p style={{fontSize: '13px', color: '#64748b'}}>These will be saved under the currently selected filters.</p>
                  </div>
                  
                  <div className="qb-preview-list">
                    {scannedResults.map((q, idx) => (
                      <div key={idx} className="qb-preview-item">
                        <button className="qb-preview-remove" onClick={() => removeScanned(idx)}><X size={12} /></button>
                        <h4>{idx + 1}. {q.text}</h4>
                        <div className="qb-preview-opts">
                          {q.options.map((o, i) => (
                            <div key={i} className={`qb-preview-opt ${o === q.correctAnswer ? 'correct' : ''}`}>
                              {['A','B','C','D'][i]}. {o}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {scanState === 'review' && (
              <div className="qb-scanner-footer">
                <button className="qb-btn-submit" style={{height: '44px'}} onClick={saveScannedQuestions} disabled={savingScanned}>
                  {savingScanned ? <Loader size={16} className="qb-spin" /> : <CheckCircle size={16} />}
                  Publish {scannedResults.length} Questions to Bank
                </button>
                <button className="qb-btn-cancel" style={{height: '44px'}} onClick={() => setScannerOpen(false)}>Discard</button>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          CSV IMPORTER MODAL
      ═══════════════════════════════════ */}
      {importerOpen && (
        <div className="qb-scanner-overlay" onClick={() => importerState === 'upload' && setImporterOpen(false)}>
          <div className="qb-scanner-card importer" onClick={e => e.stopPropagation()}>
            
            <div className="qb-scanner-header qb-importer-header">
              <h2>📥 CSV Question Importer</h2>
              <p>Batch import questions from a CSV file. Download the template to see the required format.</p>
              {importerState !== 'review' && (
                <button className="qb-scanner-close" onClick={() => setImporterOpen(false)}><X size={16} /></button>
              )}
            </div>

            <div className="qb-scanner-body">
              {importerState === 'upload' && (
                <div className="qb-upload-zone csv-zone" onClick={() => csvInputRef.current?.click()}>
                  <div className="qb-upload-icon" style={{ background: '#d1fae5', color: '#059669' }}><UploadCloud size={32} /></div>
                  <h3>Click or drag CSV file to import</h3>
                  <p>Only <strong>.csv</strong> files are supported. Export Excel files as CSV first.</p>
                  <button 
                    type="button" 
                    className="qb-template-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadCSVTemplate();
                    }}
                  >
                    ⬇ Download CSV Template
                  </button>
                  <div className="qb-import-note" style={{ textAlign: 'left', marginTop: '16px' }}>
                    <strong>Required columns:</strong> exam, subject, text, option_a, option_b, option_c, option_d, correct_answer<br />
                    <strong>correct_answer:</strong> enter A, B, C, or D (or the exact option text)
                  </div>
                  <input type="file" ref={csvInputRef} style={{display: 'none'}} accept=".csv" onChange={handleCSVUpload} />
                </div>
              )}

              {importerState === 'review' && (
                <div className="qb-preview-container">
                  <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
                    <h3 style={{fontSize: '16px', fontWeight: 700}}>Review Parsed Questions</h3>
                    <span className="qb-parsed-count">✓ {importedResults.length} questions ready</span>
                  </div>
                  <p style={{fontSize: '13px', color: '#64748b', marginBottom: '16px'}}>Remove any incorrect entries, then click <strong>Publish</strong> to add them to the bank.</p>
                  
                  <div className="qb-preview-list">
                    {importedResults.map((q, idx) => (
                      <div key={idx} className="qb-preview-item">
                        <button className="qb-preview-remove" onClick={() => removeImported(idx)}><X size={12} /></button>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <span className="qb-tag qb-tag-exam" style={{ fontSize: '10px', padding: '2px 6px' }}>{q.exam}</span>
                          <span className="qb-tag qb-tag-subject" style={{ fontSize: '10px', padding: '2px 6px' }}>{q.subject}</span>
                        </div>
                        <h4>{idx + 1}. {q.text}</h4>
                        <div className="qb-preview-opts">
                          {q.options.map((o, i) => (
                            <div key={i} className={`qb-preview-opt ${o === q.correctAnswer ? 'correct' : ''}`}>
                              {['A','B','C','D'][i]}. {o}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div className="qb-item-explanation" style={{ marginTop: '8px', border: 'none', background: '#f8fafc', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <Lightbulb size={14} style={{ color: '#eab308', flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '12px', textAlign: 'left' }}><strong>Explanation:</strong> {q.explanation}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {importerState === 'review' && (
              <div className="qb-scanner-footer">
                <button className="qb-btn-submit" style={{height: '44px'}} onClick={saveImportedQuestions} disabled={savingImported}>
                  {savingImported ? <Loader size={16} className="qb-spin" /> : <CheckCircle size={16} />}
                  Publish {importedResults.length} Questions to Bank
                </button>
                <button className="qb-btn-cancel" style={{height: '44px'}} onClick={() => setImporterOpen(false)}>Discard</button>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          DELETE MODAL
      ═══════════════════════════════════ */}
      {deleteTarget && (
        <div className="qb-scanner-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="qb-scanner-card" style={{maxWidth: '400px', padding: '32px', textAlign: 'center'}} onClick={e => e.stopPropagation()}>
            <div style={{width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{fontSize: '20px', fontWeight: 800, marginBottom: '10px'}}>Delete Question?</h3>
            <p style={{fontSize: '14px', color: '#64748b', marginBottom: '24px'}}>This action is permanent and cannot be undone.</p>
            <div style={{display: 'flex', gap: '12px'}}>
              <button 
                style={{flex: 1, height: '44px', background: '#dc2626', color: '#fff', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer'}} 
                onClick={handleDelete} disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button 
                style={{flex: 1, height: '44px', background: '#fff', color: '#374151', borderRadius: '10px', fontWeight: 600, border: '1.5px solid #e5e7eb', cursor: 'pointer'}} 
                onClick={() => setDeleteTarget(null)} disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`qb-toast qb-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};
