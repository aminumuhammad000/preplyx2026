import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, FileText, Sparkles } from 'lucide-react';
import ResumeCard from '../components/ResumeCard';
import RecentSessionsList from '../components/RecentSessionsList';
import DashboardStats from '../components/DashboardStats';
import DailyChallengeBadge from '../components/DailyChallengeBadge';

export default function Dashboard() {
  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>

      {/* Top row cards - Side-by-Side Grid for sleek compactness */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Continue Practice */}
        <ResumeCard />

        {/* Daily Challenge */}
        <div style={{
          borderRadius: '16px',
          padding: '22px 24px',
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} color="#7c3aed" /> Daily Challenge
              </span>
              <DailyChallengeBadge />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>Today's 10-Question Quiz</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px', lineHeight: 1.4 }}>
              Complete to earn 50 Preplyx coins and extend your streak.
            </p>
          </div>
          <div>
            <Link to="/dashboard/practice" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '9px 18px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#fff',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none',
              boxShadow: 'none',
              transition: 'transform 0.15s ease'
            }} className="header-hover-card">
              Start Challenge <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#64748b', marginBottom: '12px' }}>Your Stats This Week</p>
      <DashboardStats />

      {/* Exam Selection */}
      <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#64748b', marginBottom: '12px' }}>Select Exam Type</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { name: 'JAMB', desc: '7 Subjects · 2004–2024', background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)', border: 'rgba(109, 40, 217, 0.3)', Icon: BookOpen },
          { name: 'WAEC', desc: '8 Subjects · 2000–2024', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', border: 'rgba(124, 58, 237, 0.3)', Icon: GraduationCap },
          { name: 'NECO', desc: '7 Subjects · 2003–2024', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', border: 'rgba(5, 150, 105, 0.3)', Icon: FileText },
        ].map((exam) => (
          <Link key={exam.name} to={`/dashboard/practice?exam=${exam.name}`} className="exam-card-link header-hover-card" style={{
            borderRadius: '16px', padding: '20px',
            background: exam.background, boxShadow: 'none',
            border: `1px solid ${exam.border}`, textDecoration: 'none',
            display: 'flex', flexDirection: 'column', gap: '4px',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{exam.name}</span>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <exam.Icon size={20} color="#fff" />
              </div>
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', marginTop: '8px', fontWeight: 600, position: 'relative', zIndex: 1 }}>{exam.desc}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', fontWeight: 800, color: '#fff', position: 'relative', zIndex: 1 }}>
              Practice Now <ArrowRight size={14} strokeWidth={2.5} />
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Performance */}
      <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#64748b', marginBottom: '12px' }}>Recent Sessions</p>
      <RecentSessionsList />

    </div>
  );
}
