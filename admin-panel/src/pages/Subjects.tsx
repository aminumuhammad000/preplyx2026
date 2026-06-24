import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Layers, Search, CheckCircle, XCircle, X, Plus, Pencil, Trash2, RefreshCw, Loader, AlertTriangle, BookOpen,
  Calculator, BookType, Zap, FlaskConical, Leaf, BarChart3, Landmark, Vote, Sprout, BookText, Briefcase, ShoppingCart,
  Globe, Scroll, Cross, Building2, Monitor, Music, Palette, Activity, Shield, Users, Apple, Shirt, Home, PenTool,
  Hammer, Cpu, Wrench, Pen, Keyboard, Book, TrendingUp, FileQuestion
} from 'lucide-react';
import './Subjects.css';

/* ── Config ── */
const API_BASE_URL = 'http://localhost:5000/api';

// Map icon names to Lucide components for dynamic rendering
const ICON_MAP: Record<string, React.FC<any>> = {
  Calculator, BookType, Zap, FlaskConical, Leaf, BarChart3, Landmark, Vote, Sprout, BookText, Briefcase, ShoppingCart,
  Globe, Scroll, Cross, Building2, Monitor, Music, Palette, Activity, Shield, Users, Apple, Shirt, Home, PenTool,
  Hammer, Cpu, Wrench, Pen, Keyboard, Book, TrendingUp, BookOpen, Layers
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

/* ── Types ── */
interface SubjectData {
  _id: string;
  name: string;
  categories: string[];
  icon: string;
  tips: string;
  liveQuestionCount?: number;
  createdAt: string;
}

interface FormData {
  name: string;
  categories: string[];
  icon: string;
  tips: string;
}

type ToastState = { message: string; type: 'success' | 'error' } | null;

const EMPTY_FORM: FormData = {
  name: '',
  categories: [],
  icon: 'BookOpen',
  tips: '',
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<SubjectData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Category tag input
  const [categoryInput, setCategoryInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch ── */
  const fetchSubjects = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/subjects`);
      if (res.ok) setSubjects(await res.json());
      else showToast('Failed to load subjects', 'error');
    } catch {
      showToast('Network error — check your connection', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  /* ── Toast ── */
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  /* ── Open Drawer ── */
  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditingSubject(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEdit = (sub: SubjectData) => {
    setForm({
      name: sub.name,
      categories: [...sub.categories],
      icon: sub.icon || 'BookOpen',
      tips: sub.tips || '',
    });
    setEditingSubject(sub);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingSubject(null);
    setCategoryInput('');
  };

  /* ── Form Handlers ── */
  const updateField = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const addCategory = () => {
    const s = categoryInput.trim();
    if (s && !form.categories.includes(s)) {
      setForm((f) => ({ ...f, categories: [...f.categories, s] }));
    }
    setCategoryInput('');
    tagInputRef.current?.focus();
  };

  const removeCategory = (s: string) => {
    setForm((f) => ({ ...f, categories: f.categories.filter((x) => x !== s) }));
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCategory();
    } else if (e.key === 'Backspace' && !categoryInput && form.categories.length > 0) {
      removeCategory(form.categories[form.categories.length - 1]);
    }
  };

  /* ── Submit Create / Edit ── */
  const handleSubmit = async () => {
    if (!form.name || form.categories.length === 0 || !form.icon) {
      showToast('Name, categories, and icon are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const isCreate = drawerMode === 'create';
      const url = isCreate
        ? `${API_BASE_URL}/admin/subjects`
        : `${API_BASE_URL}/admin/subjects/${editingSubject?._id}`;

      const res = await fetch(url, {
        method: isCreate ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast(isCreate ? 'Subject created successfully!' : 'Subject updated successfully!', 'success');
        closeDrawer();
        fetchSubjects(true);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Something went wrong', 'error');
      }
    } catch {
      showToast('Network error — could not save subject', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/subjects/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Subject deleted successfully', 'success');
        setDeleteTarget(null);
        fetchSubjects(true);
      } else {
        showToast('Failed to delete subject', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Derived ── */
  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q)
      || s.categories.some(c => c.toLowerCase().includes(q));
  });

  const totalQuestions = subjects.reduce((sum, s) => sum + (s.liveQuestionCount || 0), 0);
  const scienceSubjects = subjects.filter(s => s.categories.includes('Science')).length;
  const artSubjects = subjects.filter(s => s.categories.includes('Art')).length;

  const renderIcon = (iconName: string, size: number = 24) => {
    const IconComponent = ICON_MAP[iconName] || BookOpen;
    return <IconComponent size={size} />;
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="sm-page">

      {/* ───── HERO ───── */}
      <div className="sm-hero">
        <div className="sm-hero-left">
          <div className="sm-hero-eyebrow">
            <Layers size={12} />
            Curriculum
          </div>
          <h1>Subjects Management</h1>
          <p className="sm-hero-sub">
            Organize academic subjects, categories, and exam tips across all examination types.
          </p>
        </div>
        <div className="sm-hero-right">
          <button className="sm-btn-secondary" onClick={() => fetchSubjects(true)} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'sm-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button className="sm-btn-primary" onClick={openCreate}>
            <Plus size={15} />
            New Subject
          </button>
        </div>
      </div>

      {/* ───── STATS ───── */}
      <div className="sm-stats">
        <div className="sm-stat-card s-total">
          <div className="sm-stat-icon s-total"><Layers size={24} color="#fff" /></div>
          <div>
            <div className="sm-stat-label">Total Subjects</div>
            <div className="sm-stat-value">{loading ? '—' : subjects.length}</div>
          </div>
        </div>
        <div className="sm-stat-card s-questions">
          <div className="sm-stat-icon s-questions"><FileQuestion size={24} color="#fff" /></div>
          <div>
            <div className="sm-stat-label">Linked Questions</div>
            <div className="sm-stat-value">{loading ? '—' : totalQuestions.toLocaleString()}</div>
          </div>
        </div>
        <div className="sm-stat-card s-science">
          <div className="sm-stat-icon s-science"><FlaskConical size={24} color="#fff" /></div>
          <div>
            <div className="sm-stat-label">Science Subjects</div>
            <div className="sm-stat-value">{loading ? '—' : scienceSubjects}</div>
          </div>
        </div>
        <div className="sm-stat-card s-art">
          <div className="sm-stat-icon s-art"><Palette size={24} color="#fff" /></div>
          <div>
            <div className="sm-stat-label">Art Subjects</div>
            <div className="sm-stat-value">{loading ? '—' : artSubjects}</div>
          </div>
        </div>
      </div>

      {/* ───── GRID HEADER ───── */}
      <div className="sm-grid-header">
        <h2>All Subjects</h2>
        <div className="sm-toolbar">
          <div className="sm-search-wrap">
            <Search size={15} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search subjects or categories…"
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

      {/* ───── CARDS GRID ───── */}
      <div className="sm-grid">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="sm-skeleton-card">
              <div className="sm-shimmer" style={{ height: '100%', width: '100%' }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="sm-empty">
            <div className="sm-empty-icon">
              <Layers size={32} />
            </div>
            <h3>{search ? 'No subjects match your search' : 'No subjects created yet'}</h3>
            <p>{search ? 'Try a different keyword.' : 'Click "New Subject" to add one.'}</p>
          </div>
        ) : (
          filtered.map((sub) => (
            <div className="sm-card" key={sub._id}>
              <div className="sm-card-body">
                <div className="sm-card-head">
                  <div className="sm-card-icon-wrap">
                    {renderIcon(sub.icon, 22)}
                  </div>
                  <div className="sm-card-title-block">
                    <div className="sm-card-name" title={sub.name}>{sub.name}</div>
                    <div className="sm-card-stats-inline">
                      <FileQuestion size={13} />
                      <span>{sub.liveQuestionCount?.toLocaleString() || 0}</span> questions
                    </div>
                  </div>
                </div>

                {sub.categories.length > 0 && (
                  <div className="sm-cats-wrap">
                    {sub.categories.map((c) => (
                      <span key={c} className="sm-cat-tag">{c}</span>
                    ))}
                  </div>
                )}

                {sub.tips && (
                  <div className="sm-card-tips">
                    {sub.tips}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="sm-card-actions">
                <button className="sm-action-btn sm-btn-edit" onClick={() => openEdit(sub)}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="sm-action-btn sm-btn-delete" onClick={() => setDeleteTarget(sub)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═══════════════════════════════════
          DRAWER — CREATE / EDIT
      ═══════════════════════════════════ */}
      {drawerOpen && (
        <>
          <div className="sm-drawer-backdrop" onClick={closeDrawer} />
          <aside className="sm-drawer">
            <div className="sm-drawer-accent" />

            <div className="sm-drawer-header">
              <span className="sm-drawer-title">
                {drawerMode === 'create' ? 'Create New Subject' : `Edit Subject`}
              </span>
              <button className="sm-drawer-close" onClick={closeDrawer}>
                <X size={16} />
              </button>
            </div>

            <div className="sm-drawer-body">
              <div className="sm-field">
                <label className="sm-field-label">Subject Name *</label>
                <input
                  className="sm-field-input"
                  placeholder="e.g. Mathematics"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="sm-field">
                <label className="sm-field-label">Categories *</label>
                <div
                  className="sm-tag-input-wrap"
                  onClick={() => tagInputRef.current?.focus()}
                >
                  {form.categories.map((c) => (
                    <span key={c} className="sm-tag">
                      {c}
                      <button className="sm-tag-remove" onClick={() => removeCategory(c)}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    className="sm-tag-input"
                    placeholder={form.categories.length === 0 ? 'Type category & press Enter…' : ''}
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={handleCategoryKeyDown}
                    onBlur={() => { if (categoryInput.trim()) addCategory(); }}
                  />
                </div>
                <span className="sm-tag-hint">Press Enter or comma to add (e.g. Science, Art). Backspace to remove.</span>
              </div>

              <div className="sm-field">
                <label className="sm-field-label">Icon</label>
                <div className="sm-icon-grid">
                  {AVAILABLE_ICONS.map((ic) => (
                    <div
                      key={ic}
                      title={ic}
                      className={`sm-icon-swatch ${form.icon === ic ? 'selected' : ''}`}
                      onClick={() => updateField('icon', ic)}
                    >
                      {renderIcon(ic, 18)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm-field">
                <label className="sm-field-label">Subject Tips</label>
                <textarea
                  className="sm-field-textarea"
                  placeholder="Comma separated topics or tips (e.g. Algebra, Sequences, Statistics)"
                  value={form.tips}
                  onChange={(e) => updateField('tips', e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sm-drawer-footer">
              <button
                className="sm-drawer-submit"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? <><Loader size={16} className="sm-spin" /> Saving…</>
                  : <><CheckCircle size={16} /> {drawerMode === 'create' ? 'Create Subject' : 'Save Changes'}</>
                }
              </button>
              <button className="sm-drawer-cancel" onClick={closeDrawer}>Cancel</button>
            </div>
          </aside>
        </>
      )}

      {/* ═══════════════════════════════════
          DELETE CONFIRMATION MODAL
      ═══════════════════════════════════ */}
      {deleteTarget && (
        <div className="sm-confirm-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="sm-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="sm-confirm-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>Delete "{deleteTarget.name}"?</h3>
            <p>
              This will permanently remove the subject from the system.
              Questions linked to <strong>{deleteTarget.name}</strong> will remain but may lose categorization.
            </p>
            <div className="sm-confirm-actions">
              <button
                className="sm-confirm-delete"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? <><Loader size={15} className="sm-spin" /> Deleting…</> : 'Yes, Delete'}
              </button>
              <button
                className="sm-confirm-cancel"
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
        <div className={`sm-toast sm-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};
