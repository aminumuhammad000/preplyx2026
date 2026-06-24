"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, BookOpen, Wallet, LineChart, LogOut, Settings, ChevronRight, Plus, Trophy, Award, Bell, CheckSquare, LayoutGrid, Menu, X, ExternalLink } from 'lucide-react';
import StreakWidget from '@/components/StreakWidget';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // If auth is loaded and user is missing, redirect to login
    if (!user && typeof window !== 'undefined') {
      const token = localStorage.getItem('preplyx_token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuSections = [
    {
      title: 'Main Menu',
      links: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Exam Categories', href: '/dashboard/categories', icon: LayoutGrid },
        { name: 'Practice CBT', href: '/dashboard/practice', icon: BookOpen },
      ]
    },
    {
      title: 'Performance',
      links: [
        { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
        { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
        { name: 'Question Review', href: '/dashboard/review', icon: CheckSquare },
      ]
    },
    {
      title: 'Account',
      links: [
        { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
        { name: 'Achievements', href: '/dashboard/achievements', icon: Award },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-bg-main)', overflow: 'hidden' }}>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 9998,
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      {/* ── Professional Sidebar ── */}
      <aside style={{
        width: isMobile ? '85%' : '250px',
        maxWidth: isMobile ? '320px' : '250px',
        minWidth: isMobile ? '280px' : '250px',
        backgroundColor: '#4B0FA3',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (sidebarOpen ? '0' : '-100%') : '0',
        top: 0,
        zIndex: isMobile ? 9999 : 1,
        transition: isMobile ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        boxShadow: isMobile ? '8px 0 32px rgba(75,15,163,0.4)' : '4px 0 24px rgba(75,15,163,0.15)',
      }}>

        {/* Logo */}
        <div style={{ padding: isMobile ? '20px 16px' : '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="/logo.png" 
              alt="Preplyx Logo" 
              style={{ 
                width: isMobile ? '32px' : '28px', 
                height: isMobile ? '32px' : '28px', 
                borderRadius: '8px',
                objectFit: 'cover'
              }} 
            />
            <span style={{ fontSize: isMobile ? '18px' : '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              Preplyx
            </span>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* Nav with scrollable area for new grouped links */}
        <nav style={{ padding: isMobile ? '20px 16px' : '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>

          {menuSections.map((section) => (
            <div key={section.title}>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px',
                color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
                padding: '0 8px', marginBottom: '10px', display: 'block'
              }}>
                {section.title}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.links.map(({ name, href, icon: Icon }) => {
                  const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
                  return (
                    <Link key={href} href={href} onClick={() => isMobile && setSidebarOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: isMobile ? '12px 12px' : '10px 12px', borderRadius: '10px',
                      fontSize: isMobile ? '14px' : '13px', fontWeight: isActive ? 700 : 400,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                      borderLeft: 'none',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      minHeight: isMobile ? '44px' : 'auto',
                      backdropFilter: isActive ? 'blur(10px)' : 'none',
                    }} className="sidebar-btn">
                      <Icon size={isMobile ? 18 : 16} style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.55)', flexShrink: 0 }} />
                      <span>{name}</span>
                      {isActive && <ChevronRight size={isMobile ? 16 : 14} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.6)' }} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

        </nav>

        {/* User Profile */}
        <div style={{ padding: isMobile ? '16px' : '12px', borderTop: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.15)' }}>

          {/* Admin Panel Link */}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: isMobile ? '12px' : '9px 12px', borderRadius: '10px', width: '100%',
              fontSize: isMobile ? '14px' : '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)',
              backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'all 0.15s ease', marginBottom: '10px', textDecoration: 'none',
              minHeight: isMobile ? '44px' : 'auto',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Settings size={isMobile ? 18 : 16} style={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0 }} />
            <span>Admin Panel</span>
            <ExternalLink size={isMobile ? 14 : 12} style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }} />
          </a>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: isMobile ? '12px' : '9px 12px', borderRadius: '10px', width: '100%',
              fontSize: isMobile ? '14px' : '13px', fontWeight: 500, color: 'rgba(255,180,180,1)',
              backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'all 0.15s ease', marginBottom: '10px',
              minHeight: isMobile ? '44px' : 'auto',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,100,100,0.15)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={isMobile ? 18 : 16} style={{ color: 'rgba(255,180,180,1)', flexShrink: 0 }} />
            <span>Logout</span>
          </button>

          {/* Avatar row */}
          <Link href="/dashboard/profile" onClick={() => isMobile && setSidebarOpen(false)} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: isMobile ? '12px' : '10px 12px', borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}>
            <div style={{
              width: isMobile ? '36px' : '32px', height: isMobile ? '36px' : '32px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.25)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: isMobile ? '14px' : '13px',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: isMobile ? '14px' : '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Student'}
              </div>
              <div style={{ fontSize: isMobile ? '12px' : '11px', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'student@preplyx.com'}
              </div>
            </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: isMobile ? '12px 16px' : '14px 32px', borderBottom: '1px solid var(--glass-border)',
          backgroundColor: '#fff', flexWrap: 'nowrap', gap: isMobile ? '8px' : '16px',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', minWidth: 0 }}>
            {/* Hamburger menu for mobile */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px', borderRadius: '10px', backgroundColor: '#f8fafc',
                  border: '1px solid var(--glass-border)', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '36px', minWidth: '36px',
                  flexShrink: 0
                }}
              >
                <Menu size={20} color="#0f172a" />
              </button>
            )}
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 700, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                HI, {user?.name?.split(' ')[0] || 'Student'}
              </div>
              {!isMobile && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Track your progress and continue learning.
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', flexShrink: 0 }}>
            <Link href="/dashboard/achievements" style={{ cursor: 'pointer' }}>
              <StreakWidget />
            </Link>
            <div style={{
              display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px',
              padding: isMobile ? '6px 10px' : '6px 6px 6px 14px', borderRadius: '40px',
              backgroundColor: '#fff', border: '1px solid var(--glass-border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={isMobile ? 11 : 12} style={{ color: '#10b981' }} />
                </div>
                <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>₦500.00</span>
              </div>
              {!isMobile && (
                <Link href="/dashboard/wallet" style={{
                  background: 'var(--gradient-primary)', color: '#fff',
                  border: 'none', borderRadius: '30px', padding: '6px 12px',
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  boxShadow: '0 2px 4px rgba(123, 47, 247, 0.2)',
                  textDecoration: 'none'
                }} className="wallet-fund-btn">
                  <Plus size={12} strokeWidth={3} /> Fund
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '28px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
