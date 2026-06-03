"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, BookOpen, Wallet, LineChart, LogOut, Settings, ChevronRight, Plus } from 'lucide-react';
import StreakWidget from '@/components/StreakWidget';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Practice CBT', href: '/dashboard/practice', icon: BookOpen },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-bg-main)', overflow: 'hidden' }}>

      {/* ── Professional Sidebar ── */}
      <aside style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '7px',
              background: 'var(--gradient-primary)', flexShrink: 0
            }} />
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
              Preplyx
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px',
            color: '#475569', textTransform: 'uppercase',
            padding: '0 8px', marginBottom: '8px', display: 'block'
          }}>
            Main Menu
          </span>

          {navLinks.map(({ name, href, icon: Icon }) => {
            const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '7px',
                fontSize: '13px', fontWeight: isActive ? 600 : 400,
                color: isActive ? '#f1f5f9' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(123, 47, 247, 0.18)' : 'transparent',
                borderLeft: isActive ? '3px solid #7B2FF7' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}>
                <Icon size={16} style={{ color: isActive ? '#7B2FF7' : '#64748b', flexShrink: 0 }} />
                <span>{name}</span>
                {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#7B2FF7', opacity: 0.7 }} />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Settings button */}
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 10px', borderRadius: '7px', width: '100%',
              fontSize: '13px', fontWeight: 400, color: '#94a3b8',
              backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'all 0.15s ease', marginBottom: '2px'
            }}
            className="sidebar-btn"
          >
            <Settings size={16} style={{ color: '#64748b', flexShrink: 0 }} />
            <span>Settings</span>
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 10px', borderRadius: '7px', width: '100%',
              fontSize: '13px', fontWeight: 400, color: '#f87171',
              backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'all 0.15s ease', marginBottom: '12px'
            }}
            className="sidebar-btn logout-btn"
          >
            <LogOut size={16} style={{ color: '#f87171', flexShrink: 0 }} />
            <span>Logout</span>
          </button>

          {/* Avatar row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px', borderRadius: '7px',
            backgroundColor: 'rgba(255,255,255,0.04)'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--gradient-primary)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: '13px'
            }}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'Student'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'student@preplyx.com'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 32px', borderBottom: '1px solid var(--glass-border)',
          backgroundColor: '#fff'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Good morning, {user?.full_name?.split(' ')[0] || 'Student'}.
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Track your progress and continue learning.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <StreakWidget />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '6px 6px 6px 14px', borderRadius: '40px',
              backgroundColor: '#fff', border: '1px solid var(--glass-border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={12} style={{ color: '#10b981' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>₦500.00</span>
              </div>
              <button style={{
                background: 'var(--gradient-primary)', color: '#fff',
                border: 'none', borderRadius: '30px', padding: '6px 12px',
                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
                boxShadow: '0 2px 4px rgba(123, 47, 247, 0.2)'
              }} className="wallet-fund-btn">
                <Plus size={12} strokeWidth={3} /> Fund
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
