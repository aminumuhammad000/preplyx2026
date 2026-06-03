import Link from 'next/link';
import { BookOpen, MonitorPlay, BrainCircuit } from 'lucide-react';

export default function Home() {
  return (
    <div className="container" style={{ padding: '0 32px' }}>
      <header className="flex justify-between items-center mt-4 mb-8">
        <div className="font-bold text-primary" style={{ fontSize: '1.5rem' }}>Preplyx</div>
        <nav className="flex gap-6 items-center">
          <Link href="#features" className="font-semibold text-muted hover:text-primary">Features</Link>
          <Link href="#about" className="font-semibold text-muted hover:text-primary">About</Link>
          <Link href="/login" className="btn-secondary">Login</Link>
          <Link href="/dashboard" className="btn-primary">Dashboard</Link>
        </nav>
      </header>

      <section className="text-center mt-8 mb-8 animate-fade-in" style={{ padding: '80px 0' }}>
        <h1 className="font-bold mb-4" style={{ fontSize: '3.5rem', lineHeight: '1.2' }}>
          Pass WAEC, NECO & JAMB With <br/>
          <span className="text-primary">Real Past Questions</span>
        </h1>
        <p className="text-muted mb-8" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Preplyx is Nigeria's premium EdTech platform providing CBT simulation, AI learning assistance, and personalized study tools.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
            Start Practicing Now
          </Link>
          <Link href="#features" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
            Explore Features
          </Link>
        </div>
      </section>

      <section id="features" className="mt-8 mb-8" style={{ padding: '40px 0' }}>
        <h2 className="text-center font-bold mb-12" style={{ fontSize: '2.5rem' }}>Why Choose Preplyx?</h2>
        <div className="flex justify-center gap-8" style={{ flexWrap: 'wrap' }}>
          
          <div className="card" style={{ width: '320px', padding: '32px' }}>
            <div className="text-primary mb-6">
               <BookOpen size={48} />
            </div>
            <h3 className="font-semibold mb-3" style={{ fontSize: '1.25rem' }}>Past Question Library</h3>
            <p className="text-muted">Access thousands of verified past questions from JAMB, WAEC, and NECO spanning over 20 years.</p>
          </div>

          <div className="card" style={{ width: '320px', padding: '32px' }}>
            <div className="text-accent mb-6">
               <MonitorPlay size={48} />
            </div>
            <h3 className="font-semibold mb-3" style={{ fontSize: '1.25rem' }}>Exam Simulation</h3>
            <p className="text-muted">Practice with a timer and interface that perfectly mimics the actual computer-based test environment.</p>
          </div>

          <div className="card" style={{ width: '320px', padding: '32px' }}>
            <div className="text-primary mb-6">
               <BrainCircuit size={48} />
            </div>
            <h3 className="font-semibold mb-3" style={{ fontSize: '1.25rem' }}>Smart Tutor</h3>
            <p className="text-muted">Get step-by-step explanations, personalized study recommendations, and clear answers from our AI tutor.</p>
          </div>

        </div>
      </section>

      <footer className="text-center mt-12 mb-4 text-muted" style={{ padding: '40px 0', borderTop: '1px solid var(--glass-border)' }}>
        <p>&copy; {new Date().getFullYear()} Preplyx. All rights reserved.</p>
      </footer>
    </div>
  );
}
