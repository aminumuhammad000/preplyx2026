"use client";
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Edit, Settings, Camera, Shield, Clock, X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    exam_type: user?.exam_type || ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  // Load fresh user data from server
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await api.getUserProfile(token);
        // Update local user data with server data
        updateUser({
          full_name: data.name,
          email: data.email,
          phone: data.phone,
          exam_type: data.exam_type,
        });
        
        setFormData({
          full_name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          exam_type: data.exam_type || ''
        });
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [token]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || user.name || '',
        email: user.email,
        phone: user.phone || '',
        exam_type: user.exam_type || ''
      });
    }
  }, [user]);

  const handleEditClick = () => {
    setFormData({
      full_name: user?.full_name || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      exam_type: user?.exam_type || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    
    try {
      setSaving(true);
      await api.updateUserProfile(token, {
        name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        exam_type: formData.exam_type,
      });
      
      // Update local user data
      updateUser(formData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditModalOpen(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <User size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: '#94a3b8' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
          Profile
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)',
        marginBottom: '24px'
      }}>
        {/* Avatar Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 700,
              color: '#fff'
            }}>
              {user?.full_name || user?.name || 'U'}
            </div>
            <button style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#7B2FF7',
              border: '3px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <Camera size={16} color="#fff" />
            </button>
          </div>
          <div style={{ flex: '1 1 250px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
              {user?.full_name || user?.name || 'Student Name'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              {user?.email || 'student@preplyx.com'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button onClick={handleEditClick} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'var(--gradient-primary)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <Edit size={16} />
                Edit Profile
              </button>
              <button onClick={() => router.push('/dashboard/settings')} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#f8fafc',
                color: 'var(--color-text-main)',
                fontSize: '14px',
                fontWeight: 600,
                border: '1px solid var(--glass-border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <Settings size={16} />
                Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '20px' }}>
            Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <User size={18} color="#7B2FF7" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Full Name
                </span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {user?.full_name || user?.name || 'Student Name'}
              </p>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Mail size={18} color="#7B2FF7" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Email Address
                </span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {user?.email || 'student@preplyx.com'}
              </p>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Phone size={18} color="#7B2FF7" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Phone Number
                </span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {user?.phone || 'Not provided'}
              </p>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Shield size={18} color="#7B2FF7" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Exam Type
                </span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {user?.exam_type || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Activity */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '20px' }}>
            Account Activity
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <Clock size={24} color="#7B2FF7" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                45
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Days Active
              </p>
            </div>
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <Shield size={24} color="#7B2FF7" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                12
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Exams Taken
              </p>
            </div>
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <User size={24} color="#7B2FF7" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                89%
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Average Score
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-soft)',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Edit Profile
              </h2>
              <button onClick={handleCancel} style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  Exam Type
                </label>
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="JAMB / WAEC / NECO">JAMB / WAEC / NECO</option>
                  <option value="JAMB">JAMB</option>
                  <option value="WAEC">WAEC</option>
                  <option value="NECO">NECO</option>
                  <option value="JAMB / WAEC">JAMB / WAEC</option>
                  <option value="JAMB / NECO">JAMB / NECO</option>
                  <option value="WAEC / NECO">WAEC / NECO</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={handleCancel} style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  color: 'var(--color-text-main)',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '8px',
                  background: saving ? '#94a3b8' : 'var(--gradient-primary)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
