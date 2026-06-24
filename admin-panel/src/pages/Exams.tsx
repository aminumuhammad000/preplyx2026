import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader,
  FileQuestion,
  Users,
  Calendar,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import './Exams.css';

/* ── Config ── */
const API_BASE_URL = 'http://localhost:5000/api';

const EXAM_COLORS = [
  '#1a56db', '#0284c7', '#059669', '#16a34a',
  '#7c3aed', '#9333ea', '#db2777', '#dc2626',
  '#ea580c', '#d97706', '#ca8a04', '#0d9488',
];

/* ── Types ── */
interface ExamData {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  years: string;
  subjects: string[];
  questionCount?: string;
  liveQuestionCount: number;
  liveSessionCount: number;
  createdAt: string;
}

interface FormData {
  name: string;
  displayName: string;
  description: string;
  color: string;
  years: string;
  subjects: string[];
}

type ToastState = { message: string; type: 'success' | 'error' } | null;

const EMPTY_FORM: FormData = {
  name: '',
  displayName: '',
  description: '',
  color: '#1a56db',
  years: '',
  subjects: [],
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export const Exams: React.FC = () => {
  const [exams, setExams] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingExam, setEditingExam] = useState<ExamData | null>(null);
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<ExamData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Subject tag input
  const [subjectInput, setSubjectInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch ── */
  const fetchExams = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/exams`);
      if (res.ok) setExams(await res.json());
      else showToast('Failed to load exams', 'error');
    } catch {
      showToast('Network error — check your connection', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  /* ── Toast ── */
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  /* ── Open Drawer ── */
  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditingExam(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEdit = (exam: ExamData) => {
    setForm({
      name: exam.name,
      displayName: exam.displayName,
      description: exam.description,
      color: exam.color,
      years: exam.years,
      subjects: [...exam.subjects],
    });
    setEditingExam(exam);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingExam(null);
    setSubjectInput('');
  };

  /* ── Form Handlers ── */
  const updateField = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const addSubject = () => {
    const s = subjectInput.trim();
    if (s && !form.subjects.includes(s)) {
      setForm((f) => ({ ...f, subjects: [...f.subjects, s] }));
    }
    setSubjectInput('');
    tagInputRef.current?.focus();
  };

  const removeSubject = (s: string) => {
    setForm((f) => ({ ...f, subjects: f.subjects.filter((x) => x !== s) }));
  };

  const handleSubjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSubject();
    } else if (e.key === 'Backspace' && !subjectInput && form.subjects.length > 0) {
      removeSubject(form.subjects[form.subjects.length - 1]);
    }
  };

  /* ── Submit Create / Edit ── */
  const handleSubmit = async () => {
    if (!form.displayName || !form.description || !form.color || !form.years) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const isCreate = drawerMode === 'create';
      const url = isCreate
        ? `${API_BASE_URL}/admin/exams`
        : `${API_BASE_URL}/admin/exams/${editingExam?._id}`;

      const body = isCreate
        ? form
        : { displayName: form.displayName, description: form.description, color: form.color, years: form.years, subjects: form.subjects };

      const res = await fetch(url, {
        method: isCreate ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(isCreate ? 'Exam created successfully!' : 'Exam updated successfully!', 'success');
        closeDrawer();
        fetchExams(true);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Something went wrong', 'error');
      }
    } catch {
      showToast('Network error — could not save exam', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/exams/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Exam deleted successfully', 'success');
        setDeleteTarget(null);
        fetchExams(true);
      } else {
        showToast('Failed to delete exam', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Derived ── */
  const filtered = exams.filter((e) => {
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q)
      || e.displayName.toLowerCase().includes(q)
      || e.description.toLowerCase().includes(q);
  });

  const totalQuestions = exams.reduce((s, e) => s + e.liveQuestionCount, 0);
  const totalSessions = exams.reduce((s, e) => s + e.liveSessionCount, 0);
  const totalSubjects = new Set(exams.flatMap((e) => e.subjects)).size;

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="em-page">

      {/* ───── HERO ───── */}
      <div className="em-hero">
        <div className="em-hero-left">
          <div className="em-hero-eyebrow">
            <BookOpen size={12} />
            Examination Board
          </div>
          <h1>Exam Management</h1>
          <p className="em-hero-sub">
            Create, edit and manage JAMB, WAEC, NECO and custom examination types for the Preplyx platform.
          </p>
        </div>
        <div className="em-hero-right">
          <button className="em-btn-secondary" onClick={() => fetchExams(true)} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'em-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button className="em-btn-primary" onClick={openCreate}>
            <Plus size={15} />
            New Exam
          </button>
        </div>
      </div>

      {/* ───── STATS ───── */}
      <div className="em-stats">
        <div className="em-stat-card s-total">
          <div className="em-stat-icon s-total"><BookOpen size={24} color="#fff" /></div>
          <div>
            <div className="em-stat-label">Total Exams</div>
            <div className="em-stat-value">{loading ? '—' : exams.length}</div>
          </div>
        </div>
        <div className="em-stat-card s-questions">
          <div className="em-stat-icon s-questions"><FileQuestion size={24} color="#fff" /></div>
          <div>
            <div className="em-stat-label">Total Questions</div>
            <div className="em-stat-value">{loading ? '—' : totalQuestions.toLocaleString()}</div>
          </div>
        </div>
        <div className="em-stat-card s-sessions">
          <div className="em-stat-icon s-sessions"><Users size={24} color="#fff" /></div>
          <div>
            <div className="em-stat-label">Exam Sessions</div>
            <div className="em-stat-value">{loading ? '—' : totalSessions.toLocaleString()}</div>
          </div>
        </div>
        <div className="em-stat-card s-subjects">
          <div className="em-stat-icon s-subjects"><Layers size={24} color="#fff" /></div>
          <div>
            <div className="em-stat-label">Unique Subjects</div>
            <div className="em-stat-value">{loading ? '—' : totalSubjects}</div>
          </div>
        </div>
      </div>

      {/* ───── GRID HEADER ───── */}
      <div className="em-grid-header">
        <h2>All Examinations</h2>
        <div className="em-toolbar">
          <div className="em-search-wrap">
            <Search size={15} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search exams…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                onClick={() => setSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───── EXAM CARDS GRID ───── */}
      <div className="em-grid">
        {loading ? (
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="em-skeleton-card">
              <div className="em-shimmer" style={{ height: 5, borderRadius: '18px 18px 0 0' }} />
              <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div className="em-shimmer" style={{ width: 52, height: 52, borderRadius: 14 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="em-shimmer" style={{ height: 20, width: '60%' }} />
                    <div className="em-shimmer" style={{ height: 13, width: '40%' }} />
                  </div>
                </div>
                <div className="em-shimmer" style={{ height: 14, width: '90%' }} />
                <div className="em-shimmer" style={{ height: 14, width: '70%' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <div className="em-shimmer" style={{ height: 24, width: 60 }} />
                  <div className="em-shimmer" style={{ height: 24, width: 80 }} />
                  <div className="em-shimmer" style={{ height: 24, width: 50 }} />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="em-empty">
            <div className="em-empty-icon">
              <BookOpen size={32} />
            </div>
            <h3>{search ? 'No exams match your search' : 'No exams created yet'}</h3>
            <p>{search ? 'Try a different keyword.' : 'Click "New Exam" to get started.'}</p>
          </div>
        ) : (
          filtered.map((exam) => (
            <div className="em-card" key={exam._id}>
              {/* Coloured top bar */}
              <div className="em-card-bar" style={{ background: exam.color }} />

              <div className="em-card-body">
                {/* Head: icon + title */}
                <div className="em-card-head">
                  <div className="em-card-icon-wrap" style={{ background: `${exam.color}15`, color: exam.color }}>
                    <BookOpen size={24} />
                  </div>
                  <div className="em-card-title-block">
                    <div className="em-card-name">{exam.displayName}</div>
                    <div className="em-card-display">{exam.name}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="em-card-desc">
                  {exam.description.length > 120
                    ? exam.description.slice(0, 120) + '…'
                    : exam.description}
                </p>

                {/* Meta chips */}
                <div className="em-card-meta">
                  <span className="em-chip"><Calendar size={11} /> {exam.years}</span>
                  <span className="em-chip"><Layers size={11} /> {exam.subjects.length} subjects</span>
                </div>

                {/* Subject tags */}
                {exam.subjects.length > 0 && (
                  <div className="em-subjects-wrap">
                    {exam.subjects.slice(0, 5).map((s) => (
                      <span key={s} className="em-subject-tag">{s}</span>
                    ))}
                    {exam.subjects.length > 5 && (
                      <span className="em-subjects-more">+{exam.subjects.length - 5} more</span>
                    )}
                  </div>
                )}

                {/* Stats row */}
                <div className="em-card-stats">
                  <div className="em-card-stat">
                    <span className="em-card-stat-val">{exam.liveQuestionCount.toLocaleString()}</span>
                    <span className="em-card-stat-lbl">Questions</span>
                  </div>
                  <div className="em-card-stat">
                    <span className="em-card-stat-val">{exam.liveSessionCount.toLocaleString()}</span>
                    <span className="em-card-stat-lbl">Sessions</span>
                  </div>
                  <div className="em-card-stat">
                    <span className="em-card-stat-val">{exam.subjects.length}</span>
                    <span className="em-card-stat-lbl">Subjects</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="em-card-actions">
                <button className="em-action-btn em-btn-edit" onClick={() => openEdit(exam)}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="em-action-btn em-btn-view-q">
                  <Eye size={13} /> Questions
                </button>
                <button className="em-action-btn em-btn-delete" onClick={() => setDeleteTarget(exam)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═══════════════════════════════════
          DRAWER — CREATE / EDIT EXAM
      ═══════════════════════════════════ */}
      {drawerOpen && (
        <>
          <div className="em-drawer-backdrop" onClick={closeDrawer} />
          <aside className="em-drawer">
            <div className="em-drawer-accent" />

            <div className="em-drawer-header">
              <span className="em-drawer-title">
                {drawerMode === 'create' ? 'Create New Exam' : `Edit — ${editingExam?.displayName}`}
              </span>
              <button className="em-drawer-close" onClick={closeDrawer}>
                <X size={16} />
              </button>
            </div>

            <div className="em-drawer-body">
              {/* Name (create only) */}
              {drawerMode === 'create' && (
                <div className="em-field">
                  <label className="em-field-label">Exam Code *</label>
                  <input
                    className="em-field-input"
                    placeholder="e.g. JAMB"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value.toUpperCase())}
                  />
                </div>
              )}

              <div className="em-field">
                <label className="em-field-label">Display Name *</label>
                <input
                  className="em-field-input"
                  placeholder="e.g. Joint Admissions and Matriculation Board"
                  value={form.displayName}
                  onChange={(e) => updateField('displayName', e.target.value)}
                />
              </div>

              <div className="em-field">
                <label className="em-field-label">Description *</label>
                <textarea
                  className="em-field-textarea"
                  placeholder="Short description of this exam type…"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>

              <div className="em-field">
                <label className="em-field-label">Years Available *</label>
                <input
                  className="em-field-input"
                  placeholder="e.g. 2000 – 2025"
                  value={form.years}
                  onChange={(e) => updateField('years', e.target.value)}
                />
              </div>

              {/* Color Picker */}
              <div className="em-field">
                <label className="em-field-label">Theme Color</label>
                <div className="em-color-grid">
                  {EXAM_COLORS.map((c) => (
                    <div
                      key={c}
                      className={`em-color-swatch ${form.color === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => updateField('color', c)}
                    />
                  ))}
                </div>
              </div>

              {/* Subjects tag input */}
              <div className="em-field">
                <label className="em-field-label">Subjects</label>
                <div
                  className="em-tag-input-wrap"
                  onClick={() => tagInputRef.current?.focus()}
                >
                  {form.subjects.map((s) => (
                    <span key={s} className="em-tag">
                      {s}
                      <button className="em-tag-remove" onClick={() => removeSubject(s)}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    className="em-tag-input"
                    placeholder={form.subjects.length === 0 ? 'Type subject & press Enter…' : ''}
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={handleSubjectKeyDown}
                    onBlur={() => { if (subjectInput.trim()) addSubject(); }}
                  />
                </div>
                <span className="em-tag-hint">Press Enter or comma to add. Backspace to remove last.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="em-drawer-footer">
              <button
                className="em-drawer-submit"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? <><Loader size={16} className="em-spin" /> Saving…</>
                  : <><CheckCircle size={16} /> {drawerMode === 'create' ? 'Create Exam' : 'Save Changes'}</>
                }
              </button>
              <button className="em-drawer-cancel" onClick={closeDrawer}>Cancel</button>
            </div>
          </aside>
        </>
      )}

      {/* ═══════════════════════════════════
          DELETE CONFIRMATION MODAL
      ═══════════════════════════════════ */}
      {deleteTarget && (
        <div className="em-confirm-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="em-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="em-confirm-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>Delete "{deleteTarget.displayName}"?</h3>
            <p>
              This will permanently remove this exam type.
              Questions linked to <strong>{deleteTarget.name}</strong> will not be deleted but will
              become orphaned. This action cannot be undone.
            </p>
            <div className="em-confirm-actions">
              <button
                className="em-confirm-delete"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? <><Loader size={15} className="em-spin" /> Deleting…</> : 'Yes, Delete'}
              </button>
              <button
                className="em-confirm-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`em-toast em-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};
