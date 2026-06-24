import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bot, 
  Key, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Settings, 
  Shield, 
  AlertTriangle,
  MessageSquare,
  Search,
  Loader,
  Edit3,
  Zap
} from 'lucide-react';
import './AIAssistant.css';
import { ChatInterface } from '../components/ChatInterface';
import '../components/ChatInterface.css';

/* ── Config ── */
const API_BASE_URL = 'http://localhost:5000/api';

/* ── Types ── */
interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  description: string;
  hasApiKey: boolean;
  apiKey?: string;
  status: 'active' | 'inactive' | 'error';
  lastUsed?: string;
}

type ToastState = { message: string; type: 'success' | 'error' } | null;

const AI_PROVIDERS: Omit<AIProvider, 'hasApiKey' | 'apiKey' | 'status' | 'lastUsed'>[] = [
  {
    id: 'chatgpt',
    name: 'chatgpt',
    displayName: 'ChatGPT',
    icon: '🤖',
    description: 'OpenAI\'s GPT models for advanced AI assistance'
  },
  {
    id: 'gemini',
    name: 'gemini',
    displayName: 'Google Gemini',
    icon: '💎',
    description: 'Google\'s multimodal AI assistant'
  },
  {
    id: 'grok',
    name: 'grok',
    displayName: 'Grok',
    icon: '🚀',
    description: 'xAI\'s real-time AI assistant'
  },
  {
    id: 'claude',
    name: 'claude',
    displayName: 'Claude',
    icon: '🧠',
    description: 'Anthropic\'s safe and helpful AI assistant'
  },
  {
    id: 'copilot',
    name: 'copilot',
    displayName: 'Microsoft Copilot',
    icon: '✈️',
    description: 'Microsoft\'s AI-powered assistant'
  },
  {
    id: 'perplexity',
    name: 'perplexity',
    displayName: 'Perplexity AI',
    icon: '🔍',
    description: 'AI-powered search and research assistant'
  },
  {
    id: 'mistral',
    name: 'mistral',
    displayName: 'Mistral AI',
    icon: '🌊',
    description: 'European open-source AI models'
  },
  {
    id: 'llama',
    name: 'llama',
    displayName: 'Meta Llama',
    icon: '🦙',
    description: 'Meta\'s open-source large language models'
  }
];

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'chat'>('management');
  const [selectedProvider, setSelectedProvider] = useState('chatgpt');
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AIProvider | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch ── */
  const fetchProviders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const savedKeys = localStorage.getItem('ai_provider_keys');
      const keys = savedKeys ? JSON.parse(savedKeys) : {};
      
      const providersWithStatus = AI_PROVIDERS.map(provider => ({
        ...provider,
        hasApiKey: !!keys[provider.id],
        apiKey: keys[provider.id] || '',
        status: keys[provider.id] ? 'active' : 'inactive',
        lastUsed: keys[`${provider.id}_lastUsed`] || undefined
      }));
      
      setProviders(providersWithStatus);
    } catch {
      showToast('Failed to load AI providers', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  /* ── Toast ── */
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  /* ── Drawer Handlers ── */
  const openEdit = (provider: AIProvider) => {
    setEditingProvider(provider);
    setApiKeyInput(provider.apiKey || '');
    setShowApiKey(false);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingProvider(null);
    setApiKeyInput('');
    setShowApiKey(false);
  };

  /* ── Save API Key ── */
  const handleSaveApiKey = async () => {
    if (!editingProvider) return;
    
    setSaving(true);
    try {
      const savedKeys = localStorage.getItem('ai_provider_keys');
      const keys = savedKeys ? JSON.parse(savedKeys) : {};
      
      if (apiKeyInput.trim()) {
        keys[editingProvider.id] = apiKeyInput.trim();
        keys[`${editingProvider.id}_lastUsed`] = new Date().toISOString();
      } else {
        delete keys[editingProvider.id];
        delete keys[`${editingProvider.id}_lastUsed`];
      }
      
      localStorage.setItem('ai_provider_keys', JSON.stringify(keys));
      
      await fetchProviders(true);
      showToast('API key saved successfully', 'success');
      closeDrawer();
    } catch {
      showToast('Failed to save API key', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete API Key ── */
  const handleDeleteApiKey = async () => {
    if (!deleteTarget) return;
    
    setDeleting(true);
    try {
      const savedKeys = localStorage.getItem('ai_provider_keys');
      const keys = savedKeys ? JSON.parse(savedKeys) : {};
      
      delete keys[deleteTarget.id];
      delete keys[`${deleteTarget.id}_lastUsed`];
      
      localStorage.setItem('ai_provider_keys', JSON.stringify(keys));
      
      await fetchProviders(true);
      showToast('API key removed successfully', 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to remove API key', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Derived ── */
  const filtered = providers.filter(p => {
    const q = search.toLowerCase();
    return p.displayName.toLowerCase().includes(q) 
      || p.description.toLowerCase().includes(q)
      || p.name.toLowerCase().includes(q);
  });

  const activeProviders = providers.filter(p => p.hasApiKey).length;
  const inactiveProviders = providers.filter(p => !p.hasApiKey).length;

  /* ── Helper ── */
  const formatLastUsed = (date?: string) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="ai-page">

      {/* ───── HERO HEADER ───── */}
      <div className="ai-hero">
        <div className="ai-hero-left">
          <div className="ai-hero-eyebrow">
            <Bot size={12} />
            AI Integration
          </div>
          <h1>AI Assistant Management</h1>
          <p className="ai-hero-sub">
            Configure and manage AI provider API keys for intelligent features across the platform.
          </p>
        </div>
        <div className="ai-hero-right">
          <button 
            className="ai-btn-secondary" 
            onClick={() => fetchProviders(true)} 
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'ai-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button 
            className="ai-btn-primary" 
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={15} />
            Open Chat
          </button>
        </div>
      </div>

      {/* ───── KPI CARDS ───── */}
      <div className="ai-kpi-grid">
        <div className="ai-kpi-card">
          <div className="ai-kpi-icon ai-kpi-success">
            <Key size={24} />
          </div>
          <div className="ai-kpi-content">
            <div className="ai-kpi-label">Active Providers</div>
            <div className="ai-kpi-value">{loading ? '...' : activeProviders}</div>
          </div>
        </div>

        <div className="ai-kpi-card">
          <div className="ai-kpi-icon ai-kpi-warning">
            <Shield size={24} />
          </div>
          <div className="ai-kpi-content">
            <div className="ai-kpi-label">Inactive Providers</div>
            <div className="ai-kpi-value">{loading ? '...' : inactiveProviders}</div>
          </div>
        </div>

        <div className="ai-kpi-card">
          <div className="ai-kpi-icon ai-kpi-primary">
            <Bot size={24} />
          </div>
          <div className="ai-kpi-content">
            <div className="ai-kpi-label">Total Available</div>
            <div className="ai-kpi-value">{loading ? '...' : providers.length}</div>
          </div>
        </div>
      </div>

      {/* ───── TABS ───── */}
      <div className="ai-tabs">
        <button 
          className={`ai-tab ${activeTab === 'management' ? 'ai-tab-active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          <Settings size={16} />
          API Key Management
        </button>
        <button 
          className={`ai-tab ${activeTab === 'chat' ? 'ai-tab-active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} />
          Chat Interface
        </button>
      </div>

      {/* ───── MANAGEMENT TAB ───── */}
      {activeTab === 'management' && (
        <>
          {/* ───── SEARCH BAR ───── */}
          <div className="ai-search-bar">
            <Search size={18} className="ai-search-icon" />
            <input
              type="text"
              placeholder="Search AI providers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ai-search-input"
            />
          </div>

          {/* ───── PROVIDERS GRID ───── */}
          {loading ? (
            <div className="ai-loading">
              <Loader size={32} className="ai-spinner" />
              <p>Loading AI providers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ai-empty">
              <AlertTriangle size={48} />
              <h3>No AI providers found</h3>
              <p>Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="ai-providers-grid">
              {filtered.map((provider) => (
                <div key={provider.id} className="ai-provider-card">
                  <div className="ai-provider-header">
                    <div className="ai-provider-icon">{provider.icon}</div>
                    <div className="ai-provider-info">
                      <h3>{provider.displayName}</h3>
                      <p>{provider.description}</p>
                    </div>
                    <div className={`ai-status-badge ${provider.status}`}>
                      {provider.status === 'active' ? (
                        <>
                          <Check size={12} />
                          Active
                        </>
                      ) : (
                        <>
                          <X size={12} />
                          Inactive
                        </>
                      )}
                    </div>
                  </div>

                  <div className="ai-provider-body">
                    {provider.hasApiKey ? (
                      <div className="ai-key-configured">
                        <div className="ai-key-info">
                          <Key size={16} className="ai-key-icon" />
                          <div className="ai-key-details">
                            <span className="ai-key-label">API Key Configured</span>
                            <span className="ai-key-meta">
                              Last used: {formatLastUsed(provider.lastUsed)}
                            </span>
                          </div>
                        </div>
                        <div className="ai-key-actions">
                          <button
                            onClick={() => openEdit(provider)}
                            className="ai-action-btn ai-edit-btn"
                          >
                            <Edit3 size={14} />
                            Update
                          </button>
                          <button
                            onClick={() => setDeleteTarget(provider)}
                            className="ai-action-btn ai-delete-btn"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="ai-key-not-configured">
                        <div className="ai-key-status">
                          <X size={16} className="ai-status-icon" />
                          <span>No API key configured</span>
                        </div>
                        <button
                          onClick={() => openEdit(provider)}
                          className="ai-configure-btn"
                        >
                          <Plus size={14} />
                          Configure API Key
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ───── CHAT TAB ───── */}
      {activeTab === 'chat' && (
        <div className="ai-chat-tab">
          <div className="ai-chat-provider-selector">
            <label>Select AI Provider:</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="ai-provider-select"
            >
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.displayName} {provider.hasApiKey ? '✓' : '(No API Key)'}
                </option>
              ))}
            </select>
          </div>
          <ChatInterface
            selectedProvider={selectedProvider}
            apiKey={providers.find(p => p.id === selectedProvider)?.apiKey || ''}
            onProviderChange={setSelectedProvider}
          />
        </div>
      )}

      {/* ───── DRAWER ───── */}
      {drawerOpen && editingProvider && (
        <div className="ai-drawer-overlay" onClick={closeDrawer}>
          <div className="ai-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="ai-drawer-header">
              <div className="ai-drawer-title">
                <div className="ai-drawer-icon">{editingProvider.icon}</div>
                <div>
                  <h2>Configure {editingProvider.displayName}</h2>
                  <p>Enter your API key to enable this AI provider</p>
                </div>
              </div>
              <button onClick={closeDrawer} className="ai-drawer-close">
                <X size={20} />
              </button>
            </div>

            <div className="ai-drawer-body">
              <div className="ai-form-group">
                <label>API Key</label>
                <div className="ai-input-wrapper">
                  <Key size={18} className="ai-input-icon" />
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter your API key"
                    className="ai-input"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="ai-visibility-toggle"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="ai-input-hint">
                  Your API key will be stored locally in your browser.
                </p>
              </div>
            </div>

            <div className="ai-drawer-footer">
              <button onClick={closeDrawer} className="ai-btn-cancel">
                Cancel
              </button>
              <button 
                onClick={handleSaveApiKey} 
                className="ai-btn-save"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader size={16} className="ai-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save API Key
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── DELETE CONFIRMATION MODAL ───── */}
      {deleteTarget && (
        <div className="ai-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <AlertTriangle size={24} className="ai-modal-icon" />
              <h2>Remove API Key</h2>
            </div>
            <div className="ai-modal-body">
              <p>
                Are you sure you want to remove the API key for <strong>{deleteTarget.displayName}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="ai-modal-footer">
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="ai-btn-cancel"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteApiKey} 
                className="ai-btn-delete"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader size={16} className="ai-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Remove Key
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── TOAST NOTIFICATION ───── */}
      {toast && (
        <div className={`ai-toast ai-toast-${toast.type}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
};