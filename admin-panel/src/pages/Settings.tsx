import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Info,
  Globe,
  Mail,
  Phone,
  BookOpen
} from 'lucide-react';
import './Settings.css';

/* ── Config ── */
const API_BASE_URL = 'http://localhost:5000/api';

/* ── Types ── */
interface SystemSettings {
  // Wallet Fees
  examUnlockFee: number;
  welcomeBonus: number;
  virtualAccountFee: number;

  // General Settings
  platformName: string;
  supportEmail: string;
  supportPhone: string;

  // Security settings
  requireEmailVerification: boolean;
  allowMultipleLogins: boolean;

  // Exam settings
  freeTrialSessions: number;
  globalNegativeMarking: boolean;
  defaultPassMark: number;

  // API Credentials
  vtstackPublicKey: string;
  vtstackSecretKey: string;
  vtstackSandbox: boolean;
  geminiApiKey: string;
}

type TabType = 'general' | 'exam' | 'security' | 'integrations';
type ToastState = { message: string; type: 'success' | 'error' } | null;

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */
export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // System Settings state
  const [settings, setSettings] = useState<SystemSettings>({
    examUnlockFee: 200,
    welcomeBonus: 500,
    virtualAccountFee: 100,
    platformName: 'PreplyX CBT',
    supportEmail: 'support@preplyx.com',
    supportPhone: '+234 800 123 4567',
    requireEmailVerification: false,
    allowMultipleLogins: true,
    freeTrialSessions: 3,
    globalNegativeMarking: false,
    defaultPassMark: 50,
    vtstackPublicKey: '',
    vtstackSecretKey: '',
    vtstackSandbox: true,
    geminiApiKey: ''
  });

  // Credential visibility states
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Toast notifier
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch Settings from backend
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings({
          examUnlockFee: data.examUnlockFee ?? 200,
          welcomeBonus: data.welcomeBonus ?? 500,
          virtualAccountFee: data.virtualAccountFee ?? 100,
          platformName: data.platformName || 'PreplyX CBT',
          supportEmail: data.supportEmail || 'support@preplyx.com',
          supportPhone: data.supportPhone || '+234 800 123 4567',
          requireEmailVerification: data.requireEmailVerification ?? false,
          allowMultipleLogins: data.allowMultipleLogins ?? true,
          freeTrialSessions: data.freeTrialSessions ?? 3,
          globalNegativeMarking: data.globalNegativeMarking ?? false,
          defaultPassMark: data.defaultPassMark ?? 50,
          vtstackPublicKey: data.vtstackPublicKey || '',
          vtstackSecretKey: data.vtstackSecretKey || '',
          vtstackSandbox: data.vtstackSandbox ?? true,
          geminiApiKey: data.geminiApiKey || ''
        });
      } else {
        throw new Error('Failed to load settings');
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
      showToast('Error loading system settings', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Manual Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSettings();
    setRefreshing(false);
    showToast('Platform settings refreshed!');
  };

  // Form Submit Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (settings.defaultPassMark < 0 || settings.defaultPassMark > 100) {
      showToast('Default pass mark must be between 0% and 100%', 'error');
      return;
    }
    if (settings.freeTrialSessions < 0) {
      showToast('Free trial sessions cannot be negative', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        showToast('System configuration saved successfully!');
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      showToast('Failed to save settings to database', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sm-page">
      {/* ── Toast Alert ── */}
      {toast && (
        <div className="sm-toast-container">
          <div className={`sm-toast ${toast.type === 'error' ? 'error' : ''}`}>
            <Info size={16} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Hero Header ── */}
      <header className="sm-hero">
        <div className="sm-hero-left">
          <div className="sm-hero-eyebrow">
            <SettingsIcon size={14} />
            <span>Control Center</span>
          </div>
          <h1>System Settings</h1>
          <p className="sm-hero-sub">
            Customize platform defaults, toggle security settings, adjust CBT engine configurations, and manage API keys.
          </p>
        </div>
        <div className="sm-hero-right">
          <button
            className={`sm-btn-refresh ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title="Reload Configs"
            disabled={refreshing || loading}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* ── Settings Sidebar Layout ── */}
      <div className="sm-layout">
        {/* Navigation Sidebar */}
        <nav className="sm-sidebar">
          <button
            className={`sm-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Globe size={18} />
            General Setup
          </button>
          <button
            className={`sm-tab-btn ${activeTab === 'exam' ? 'active' : ''}`}
            onClick={() => setActiveTab('exam')}
          >
            <BookOpen size={18} />
            CBT Exam Engine
          </button>
          <button
            className={`sm-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} />
            Security & Login
          </button>
          <button
            className={`sm-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            <Key size={18} />
            API Integrations
          </button>
        </nav>

        {/* Content Panel Card */}
        <section className="sm-panel">
          {loading ? (
            <div className="sm-panel-shimmer">
              <div className="sm-shimmer-title" />
              <div className="sm-shimmer-bar" />
              <div className="sm-shimmer-bar" style={{ width: '80%' }} />
              <div className="sm-shimmer-bar" style={{ width: '60%' }} />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="sm-form">
              {/* ── Tab: General setup ── */}
              {activeTab === 'general' && (
                <>
                  <div className="sm-panel-header">
                    <h2 className="sm-panel-title">General Platform Settings</h2>
                    <p className="sm-panel-desc">Configure your platform brand identity and default customer support information.</p>
                  </div>

                  <div className="sm-form-grid">
                    <div className="sm-form-group full-width">
                      <label className="sm-form-lbl">Platform/Branding Name</label>
                      <div className="sm-input-wrapper">
                        <input
                          type="text"
                          required
                          value={settings.platformName}
                          onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                          className="sm-input"
                          placeholder="e.g. PreplyX CBT"
                        />
                      </div>
                      <span className="sm-form-desc">Used on emails, invoices, and exam dashboards.</span>
                    </div>

                    <div className="sm-form-group">
                      <label className="sm-form-lbl">
                        <Mail size={14} />
                        Support Email Address
                      </label>
                      <div className="sm-input-wrapper">
                        <input
                          type="email"
                          required
                          value={settings.supportEmail}
                          onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                          className="sm-input"
                          placeholder="support@preplyx.com"
                        />
                      </div>
                      <span className="sm-form-desc">Contact email address displayed to students.</span>
                    </div>

                    <div className="sm-form-group">
                      <label className="sm-form-lbl">
                        <Phone size={14} />
                        Support Phone Number
                      </label>
                      <div className="sm-input-wrapper">
                        <input
                          type="text"
                          required
                          value={settings.supportPhone}
                          onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                          className="sm-input"
                          placeholder="+234 800 123 4567"
                        />
                      </div>
                      <span className="sm-form-desc">Displayed on invoice footers and contact pages.</span>
                    </div>
                  </div>
                </>
              )}

              {/* ── Tab: CBT Exam Engine ── */}
              {activeTab === 'exam' && (
                <>
                  <div className="sm-panel-header">
                    <h2 className="sm-panel-title">CBT Exam Engine Config</h2>
                    <p className="sm-panel-desc">Manage system-wide defaults for exams, sessions, trial balances, and scoring.</p>
                  </div>

                  <div className="sm-form-grid">
                    <div className="sm-form-group">
                      <label className="sm-form-lbl">Free Trial Exam Sessions</label>
                      <div className="sm-input-wrapper">
                        <input
                          type="number"
                          required
                          min={0}
                          value={settings.freeTrialSessions}
                          onChange={(e) => setSettings({ ...settings, freeTrialSessions: Number(e.target.value) })}
                          className="sm-input"
                        />
                      </div>
                      <span className="sm-form-desc">Number of free attempts granted to newly registered students.</span>
                    </div>

                    <div className="sm-form-group">
                      <label className="sm-form-lbl">Default Pass Mark Percentage</label>
                      <div className="sm-input-wrapper">
                        <input
                          type="number"
                          required
                          min={0}
                          max={100}
                          value={settings.defaultPassMark}
                          onChange={(e) => setSettings({ ...settings, defaultPassMark: Number(e.target.value) })}
                          className="sm-input has-prefix"
                        />
                        <span className="sm-input-prefix" style={{ left: 'auto', right: 14 }}>%</span>
                      </div>
                      <span className="sm-form-desc">Assumed pass threshold used globally across analytics dashboards.</span>
                    </div>

                    <div className="sm-form-group full-width" style={{ marginTop: 8 }}>
                      <div className="sm-toggle-row">
                        <div className="sm-toggle-left">
                          <span className="sm-toggle-title">Global Negative Marking</span>
                          <span className="sm-toggle-desc">
                            When enabled, incorrect exam answers will deduct partial scores globally unless overridden on specific exams.
                          </span>
                        </div>
                        <label className="sm-switch">
                          <input
                            type="checkbox"
                            checked={settings.globalNegativeMarking}
                            onChange={(e) => setSettings({ ...settings, globalNegativeMarking: e.target.checked })}
                          />
                          <span className="sm-slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Tab: Security settings ── */}
              {activeTab === 'security' && (
                <>
                  <div className="sm-panel-header">
                    <h2 className="sm-panel-title">Security & Session Rules</h2>
                    <p className="sm-panel-desc">Manage student authentication, active login regulations, and access restrictions.</p>
                  </div>

                  <div className="sm-form" style={{ gap: 20 }}>
                    <div className="sm-toggle-row">
                      <div className="sm-toggle-left">
                        <span className="sm-toggle-title">Mandatory Email Verification</span>
                        <span className="sm-toggle-desc">
                          Require students to verify their email address before accessing simulator practices and exams.
                        </span>
                      </div>
                      <label className="sm-switch">
                        <input
                          type="checkbox"
                          checked={settings.requireEmailVerification}
                          onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                        />
                        <span className="sm-slider" />
                      </label>
                    </div>

                    <div className="sm-toggle-row">
                      <div className="sm-toggle-left">
                        <span className="sm-toggle-title">Allow Concurrent Device Logins</span>
                        <span className="sm-toggle-desc">
                          Permit a student account to maintain active concurrent sessions across multiple devices or browsers.
                        </span>
                      </div>
                      <label className="sm-switch">
                        <input
                          type="checkbox"
                          checked={settings.allowMultipleLogins}
                          onChange={(e) => setSettings({ ...settings, allowMultipleLogins: e.target.checked })}
                        />
                        <span className="sm-slider" />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* ── Tab: Credentials / API Integrations ── */}
              {activeTab === 'integrations' && (
                <>
                  <div className="sm-panel-header">
                    <h2 className="sm-panel-title">API & Integrations Keys</h2>
                    <p className="sm-panel-desc">Manage third-party connection credentials for payments, banking, and AI assistance.</p>
                  </div>

                  <div className="sm-form" style={{ gap: 24 }}>
                    {/* VTStack Sandbox Mode */}
                    <div className="sm-toggle-row" style={{ marginBottom: 8 }}>
                      <div className="sm-toggle-left">
                        <span className="sm-toggle-title">VTStack Sandbox Mode</span>
                        <span className="sm-toggle-desc">
                          Toggles the payment gateway to run in sandbox simulation mode. No real money will be charged.
                        </span>
                      </div>
                      <label className="sm-switch">
                        <input
                          type="checkbox"
                          checked={settings.vtstackSandbox}
                          onChange={(e) => setSettings({ ...settings, vtstackSandbox: e.target.checked })}
                        />
                        <span className="sm-slider" />
                      </label>
                    </div>

                    <div className="sm-form-grid">
                      {/* VTStack Public Key */}
                      <div className="sm-form-group">
                        <label className="sm-form-lbl">VTStack Public Key</label>
                        <div className="sm-input-wrapper">
                          <input
                            type="text"
                            value={settings.vtstackPublicKey}
                            onChange={(e) => setSettings({ ...settings, vtstackPublicKey: e.target.value })}
                            className="sm-input"
                            placeholder="pk_test_..."
                          />
                        </div>
                        <span className="sm-form-desc">Used on the client-side for virtual account integrations.</span>
                      </div>

                      {/* VTStack Secret Key */}
                      <div className="sm-form-group">
                        <label className="sm-form-lbl">VTStack Secret Key</label>
                        <div className="sm-input-wrapper">
                          <input
                            type={showSecretKey ? 'text' : 'password'}
                            value={settings.vtstackSecretKey}
                            onChange={(e) => setSettings({ ...settings, vtstackSecretKey: e.target.value })}
                            className="sm-input"
                            placeholder="sk_test_..."
                          />
                          <button
                            type="button"
                            className="sm-input-eye"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                          >
                            {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <span className="sm-form-desc">Secure key used by the backend to verify transactions.</span>
                      </div>

                      {/* Gemini API Key */}
                      <div className="sm-form-group full-width">
                        <label className="sm-form-lbl">Google Gemini API Key</label>
                        <div className="sm-input-wrapper">
                          <input
                            type={showGeminiKey ? 'text' : 'password'}
                            value={settings.geminiApiKey}
                            onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                            className="sm-input"
                            placeholder="AIzaSy..."
                          />
                          <button
                            type="button"
                            className="sm-input-eye"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                          >
                            {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <span className="sm-form-desc">Powering the AI-assisted optical character recognition (OCR) question paper scanner.</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Save Actions Bar ── */}
              <div className="sm-actions-bar">
                <button type="submit" className="sm-btn-save" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="spinning" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save System Config
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
