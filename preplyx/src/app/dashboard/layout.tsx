"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, BookOpen, Wallet, LineChart, LogOut, Settings, Plus, Trophy, Award, Bell, CheckSquare, LayoutGrid, Menu, X } from 'lucide-react';
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
      ],
    },
    {
      title: 'Performance',
      links: [
        { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
        { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
        { name: 'Question Review', href: '/dashboard/review', icon: CheckSquare },
      ],
    },
    {
      title: 'Account',
      links: [
        { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
        { name: 'Achievements', href: '/dashboard/achievements', icon: Award },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #f8f6ff 0%, #f5f7ff 100%)', overflow: 'hidden' }}>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            zIndex: 9998,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      <aside
        style={{
          width: isMobile ? '84%' : '230px',
          maxWidth: isMobile ? '280px' : '230px',
          minWidth: isMobile ? '240px' : '230px',
          background: 'linear-gradient(180deg, #6d28d9 0%, #4c1d95 100%)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile ? (sidebarOpen ? '0' : '-100%') : '0',
          top: 0,
          zIndex: isMobile ? 9999 : 1,
          transition: isMobile ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          boxShadow: isMobile ? '12px 0 36px rgba(30, 10, 76, 0.35)' : '10px 0 30px rgba(76, 29, 149, 0.16)',
        }}
      >
        <div style={{ padding: isMobile ? '20px 16px' : '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/logo.svg"
                alt="Preplyx logo"
                style={{
                  width: isMobile ? '48px' : '44px',
                  height: isMobile ? '48px' : '44px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
                }}
              />
              <div>
                <div style={{ fontSize: isMobile ? '22px' : '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Preplyx</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Study Hub</div>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.16)', cursor: 'pointer', color: '#fff',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              >
                <X size={20} />
              </button>
            )}
          </div>
          <div style={{ padding: '10px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1.4px' }}>Ready to learn?</div>
            <div style={{ fontSize: '13px', color: '#fff', marginTop: '4px', fontWeight: 600 }}>Keep your streak alive today.</div>
          </div>
        </div>

        <nav style={{ padding: isMobile ? '16px 12px' : '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
          {menuSections.map((section) => (
            <div key={section.title}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px', display: 'block' }}>
                {section.title}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.links.map(({ name, href, icon: Icon }) => {
                  const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: isMobile ? '12px 12px' : '10px 12px',
                        borderRadius: '12px',
                        fontSize: isMobile ? '14px' : '13px',
                        fontWeight: isActive ? 700 : 500,
                        color: '#fff',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                        border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        transform: isActive ? 'translateX(2px)' : 'translateX(0)',
                        boxShadow: isActive ? '0 10px 20px rgba(0,0,0,0.12)' : 'none',
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <Icon size={isMobile ? 18 : 16} style={{ color: '#fff', flexShrink: 0 }} />
                      <span>{name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ padding: isMobile ? '16px' : '12px', borderTop: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.16)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: isMobile ? '12px' : '9px 12px', borderRadius: '12px', width: '100%',
              fontSize: isMobile ? '14px' : '13px', fontWeight: 600, color: '#fff',
              backgroundColor: 'transparent', border: '1px solid transparent', cursor: 'pointer',
              transition: 'all 0.2s ease', marginBottom: '10px',
              minHeight: isMobile ? '44px' : 'auto',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,100,100,0.16)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={isMobile ? 18 : 16} style={{ color: '#fff', flexShrink: 0 }} />
            <span>Logout</span>
          </button>

          <Link href="/dashboard/profile" onClick={() => isMobile && setSidebarOpen(false)} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: isMobile ? '12px' : '10px 12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', cursor: 'pointer', transition: 'background-color 0.2s ease' }}>
              <div style={{ width: isMobile ? '36px' : '32px', height: isMobile ? '36px' : '32px', borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: isMobile ? '14px' : '13px', border: '2px solid rgba(255,255,255,0.3)' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: isMobile ? '14px' : '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Student'}
                </div>
                <div style={{ fontSize: isMobile ? '12px' : '11px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'student@preplyx.com'}
                </div>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: isMobile ? '12px 14px' : '18px 24px', borderBottom: '1px solid rgba(15,23,42,0.08)', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: isMobile ? '8px' : '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px', minWidth: 0 }}>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '8px', borderRadius: '10px', backgroundColor: '#fff',
                    border: '1px solid rgba(15,23,42,0.08)', cursor: 'pointer', transition: 'all 0.2s ease',
                    minHeight: '36px', minWidth: '36px', flexShrink: 0, boxShadow: '0 6px 14px rgba(15,23,42,0.06)',
                  }}
                >
                  <Menu size={18} color="#4b5563" />
                </button>
              )}
              <div>
                <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                  Hi, {user?.name?.split(' ')[0] || 'Student'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Keep your learning momentum strong today.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexShrink: 0 }}>
              <Link href="/dashboard/achievements" style={{ cursor: 'pointer' }}>
                <StreakWidget />
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isMobile ? '6px 10px' : '8px 10px 8px 14px', borderRadius: '999px', background: 'linear-gradient(135deg, #ffffff 0%, #f4f1ff 100%)', border: '1px solid rgba(109, 40, 217, 0.16)', boxShadow: '0 8px 16px rgba(109, 40, 217, 0.08)' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={15} style={{ color: '#6d28d9' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700 }}>Wallet</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>₦500.00</div>
                </div>
                {!isMobile && (
                  <Link href="/dashboard/wallet" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#fff', border: 'none', borderRadius: '999px', padding: '7px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 8px 16px rgba(109, 40, 217, 0.2)', textDecoration: 'none' }}>
                    <Plus size={12} strokeWidth={3} /> Fund
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '28px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
