import Link from 'next/link';
import { ArrowRight, Flame, BookOpen, GraduationCap, FileText } from 'lucide-react';
import ResumeCard from '@/components/ResumeCard';
import RecentSessionsList from '@/components/RecentSessionsList';
import DashboardStats from '@/components/DashboardStats';
import DailyChallengeBadge from '@/components/DailyChallengeBadge';

export default function Dashboard() {
  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>

      {/* Top row cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>

        {/* Continue Practice */}
        <ResumeCard />

        {/* Daily Challenge */}
        <div style={{ flex: 1, borderRadius: '12px', padding: '24px', backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Daily Challenge</p>
            <DailyChallengeBadge />
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-main)' }}>Today&apos;s 10-Question Quiz</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>Complete to earn 50 Preplyx coins and extend your streak.</p>
          <Link href="/dashboard/challenge" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: '8px',
            background: 'var(--gradient-primary)', color: '#fff',
            fontSize: '13px', fontWeight: 600, textDecoration: 'none'
          }}>
            Start Challenge <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      {/* Stats row */}
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Your Stats This Week</p>
      <DashboardStats />

      {/* Exam Selection */}
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Select Exam Type</p>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
        {[
          { name: 'JAMB', desc: '7 Subjects · 2004–2024', color: '#4B0FA3', Icon: BookOpen },
          { name: 'WAEC', desc: '8 Subjects · 2000–2024', color: '#7B2FF7', Icon: GraduationCap },
          { name: 'NECO', desc: '7 Subjects · 2003–2024', color: '#4B0FA3', Icon: FileText },
        ].map((exam) => (
          <Link key={exam.name} href={`/dashboard/practice?exam=${exam.name}`} className="exam-card-link" style={{
            flex: 1, borderRadius: '12px', padding: '20px',
            backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)',
            border: '1px solid var(--glass-border)', textDecoration: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex', flexDirection: 'column', gap: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: exam.color }}>{exam.name}</span>
              <exam.Icon size={20} color={exam.color} style={{ opacity: 0.8 }} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{exam.desc}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '12px', fontWeight: 600, color: exam.color }}>
              Practice Now <ArrowRight size={13} />
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Performance */}
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Recent Sessions</p>
      <RecentSessionsList />

    </div>
  );
}
