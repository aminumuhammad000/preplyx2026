"use client";
import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Globe, Shield, LogOut, User, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type SettingsItem = 
  | {
      label: string;
      description: string;
      type: 'toggle';
      value: boolean;
      onChange?: (value: boolean) => void;
    }
  | {
      label: string;
      description: string;
      type: 'select';
      value: string;
      onChange?: (value: string) => void;
      options?: string[];
    }
  | {
      label: string;
      description: string;
      type: 'password';
    };

type SettingsSection = {
  title: string;
  icon: any;
  items: SettingsItem[];
};

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  // Load settings from server on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await api.getUserProfile(token);
        if (data.settings) {
          setDarkMode(data.settings.darkMode || false);
          setNotifications(data.settings.notifications !== false);
          setEmailNotifications(data.settings.emailNotifications !== false);
          setLanguage(data.settings.language || 'English');
        }
        
        // Apply dark mode to document
        if (data.settings?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fallback to localStorage if server fails
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        const savedLanguage = localStorage.getItem('language') || 'English';
        setDarkMode(savedDarkMode);
        setLanguage(savedLanguage);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  // Apply dark mode when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save settings to server
  const saveSettings = async () => {
    if (!token) return;
    
    try {
      setSaving(true);
      await api.updateUserSettings(token, {
        darkMode,
        notifications,
        emailNotifications,
        language,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save settings when they change
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        saveSettings();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [darkMode, notifications, emailNotifications, language, loading]);

  const settingsSections: SettingsSection[] = [
    {
      title: 'Appearance',
      icon: Sun,
      items: [
        {
          label: 'Dark Mode',
          description: 'Switch between light and dark theme',
          type: 'toggle',
          value: darkMode,
          onChange: setDarkMode
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Push Notifications',
          description: 'Receive notifications on your device',
          type: 'toggle',
          value: notifications,
          onChange: setNotifications
        },
        {
          label: 'Email Notifications',
          description: 'Receive updates via email',
          type: 'toggle',
          value: emailNotifications,
          onChange: setEmailNotifications
        }
      ]
    },
    {
      title: 'Language & Region',
      icon: Globe,
      items: [
        {
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          value: language,
          onChange: setLanguage,
          options: ['English', 'French', 'Spanish', 'Portuguese']
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Change Password',
          description: 'Update your account password',
          type: 'password'
        },
        {
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          type: 'toggle',
          value: false
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Shield size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: '#94a3b8' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
            Settings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Manage your account preferences and settings
          </p>
        </div>
        {saving && (
          <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
            Saving...
          </div>
        )}
      </div>

      {/* Settings Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {settingsSections.map((section) => (
          <div
            key={section.title}
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow-soft)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: darkMode ? '#2d2d4a' : '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <section.icon size={20} color="#7B2FF7" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {section.title}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {section.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: darkMode ? '#1a1a2e' : '#f8fafc',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {item.description}
                    </p>
                  </div>

                  {item.type === 'toggle' && (
                    <button
                      onClick={() => item.onChange?.(!item.value)}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: item.value ? '#7B2FF7' : '#cbd5e1',
                        position: 'relative',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'background-color 0.2s ease-in-out',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        position: 'absolute',
                        top: '2px',
                        left: '2px',
                        transform: item.value ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s ease-in-out',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }} />
                    </button>
                  )}

                  {item.type === 'select' && (
                    <select
                      value={typeof item.value === 'string' ? item.value : ''}
                      onChange={(e) => item.onChange?.(e.target.value)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        fontSize: '13px',
                        backgroundColor: darkMode ? '#1a1a2e' : '#fff',
                        color: 'var(--color-text-main)',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {item.options?.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {item.type === 'password' && (
                    <button style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: darkMode ? '#1a1a2e' : '#fff',
                      color: '#7B2FF7',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                      Change
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Account Actions */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)',
        marginTop: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: darkMode ? '#4a2d2d' : '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LogOut size={20} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Account Actions
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: darkMode ? '#1a1a2e' : '#f8fafc',
            border: '1px solid var(--glass-border)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}>
            <User size={20} color="#64748b" />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '2px' }}>
                Edit Profile
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Update your personal information
              </p>
            </div>
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: darkMode ? '#4a2d2d' : '#fef2f2',
            border: darkMode ? '1px solid #7f1d1d' : '1px solid #fecaca',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}>
            <LogOut size={20} color="#ef4444" />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', marginBottom: '2px' }}>
                Logout
              </p>
              <p style={{ fontSize: '12px', color: '#991b1b' }}>
                Sign out of your account
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)',
        marginTop: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: darkMode ? '#4a2d2d' : '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={20} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>
              Delete Account
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Permanently delete your account and all data
            </p>
          </div>
        </div>
        <button style={{
          padding: '10px 20px',
          borderRadius: '8px',
          backgroundColor: darkMode ? '#4a2d2d' : '#fef2f2',
          color: '#ef4444',
          fontSize: '13px',
          fontWeight: 600,
          border: darkMode ? '1px solid #7f1d1d' : '1px solid #fecaca',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          Delete Account
        </button>
      </div>

      {/* App Info */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)',
        marginTop: '24px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Preplyx CBT Platform
        </p>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          Version 1.0.0 • © 2026 Preplyx. All rights reserved.
        </p>
      </div>
    </div>
  );
}
