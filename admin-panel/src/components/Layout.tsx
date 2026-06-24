import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Library, 
  FileQuestion, 
  MonitorPlay, 
  Wallet, 
  Bot, 
  BarChart3, 
  Bell, 
  Headset, 
  Settings,
  Search,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import './Layout.css';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'User Management', path: '/users', icon: Users },
  { name: 'Exam Management', path: '/exams', icon: BookOpen },
  { name: 'Subject Management', path: '/subjects', icon: Library },
  { name: 'Question Bank', path: '/questions', icon: FileQuestion },
  { name: 'CBT Simulation', path: '/simulation', icon: MonitorPlay },
  { name: 'Wallet & Payments', path: '/wallet', icon: Wallet },
  { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Support Center', path: '/support', icon: Headset },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('preplyx_token'); // Clear shared token
    navigate('/login');
  };

  const adminUserStr = localStorage.getItem('adminUser');
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;
  const adminName = adminUser?.name || 'Super Admin';

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <img src={logoImg} alt="Preplyx Logo" className="sidebar-logo" />
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Preplyx</span>
              <span className="sidebar-brand-subtitle">Admin Panel</span>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}
          >
            <ExternalLink size={20} />
            <span>Go to Preplyx</span>
          </a>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="topbar">
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <div className="topbar-actions">
            <button
              className="icon-btn"
              title="Notifications"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={20} />
            </button>
            <div
              className="admin-profile"
              style={{ cursor: 'pointer' }}
              title="My Profile"
              onClick={() => navigate('/profile')}
            >
              <div className="avatar">{adminName.charAt(0).toUpperCase()}</div>
              <div className="profile-info">
                <span className="name">{adminName}</span>
                <span className="role">Full Access</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
