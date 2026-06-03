"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getActiveSession, ActiveSession } from '@/lib/storage';

export default function ResumeCard() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(getActiveSession());
  }, []);

  if (!mounted) {
    return (
      <div style={{ flex: 1, borderRadius: '12px', padding: '24px', background: 'var(--gradient-primary)', color: '#fff', opacity: 0.8 }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.75, marginBottom: '8px' }}>Loading Session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ flex: 1, borderRadius: '12px', padding: '24px', background: 'var(--gradient-primary)', color: '#fff' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.75, marginBottom: '8px' }}>Ready to Practice</p>
        <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Start a New Exam</h2>
        <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '20px' }}>Select an exam type below to begin.</p>
        <Link href="/dashboard/practice" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 18px', borderRadius: '8px',
          backgroundColor: '#fff', color: 'var(--color-primary)',
          fontSize: '13px', fontWeight: 600, textDecoration: 'none'
        }}>
          Start Now <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const remainingPct = Math.round(((session.totalQ - session.currentQIndex) / session.totalQ) * 100);

  return (
    <div style={{ flex: 1, borderRadius: '12px', padding: '24px', background: 'var(--gradient-primary)', color: '#fff' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.75, marginBottom: '8px' }}>Continue Where You Stopped</p>
      <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', textTransform: 'capitalize' }}>
        {session.exam} {session.subject}
      </h2>
      <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '20px' }}>
        Question {session.currentQIndex + 1} of {session.totalQ} &mdash; {remainingPct}% remaining
      </p>
      <Link href={`/dashboard/practice/${session.exam}/${session.subject}`} style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '8px 18px', borderRadius: '8px',
        backgroundColor: '#fff', color: 'var(--color-primary)',
        fontSize: '13px', fontWeight: 600, textDecoration: 'none'
      }}>
        Resume <ArrowRight size={14} />
      </Link>
    </div>
  );
}
