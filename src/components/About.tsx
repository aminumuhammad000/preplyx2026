import { motion } from 'framer-motion';
import { WifiOff, Smartphone, RefreshCw, GraduationCap } from 'lucide-react';

const About = () => {
  const highlights = [
    { icon: <WifiOff />, title: "Offline Access", desc: "Study anywhere, anytime without internet connection." },
    { icon: <Smartphone />, title: "Easy-to-use Interface", desc: "Clean, modern design built for mobile and desktop." },
    { icon: <RefreshCw />, title: "Updated Questions", desc: "Latest verified past questions from recent exams." },
    { icon: <GraduationCap />, title: "Built for Nigerians", desc: "Tailored specifically for WAEC, NECO, and JAMB." }
  ];

  return (
    <section id="about" className="relative overflow-hidden bg-white py-24">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              About Preplyx
            </div>
            <h3 className="mb-6 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Study Smarter, Not Harder.
            </h3>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-600">
              Preplyx helps students prepare for WAEC, NECO, and JAMB using realistic practice, clear progress insight, and calm study routines that build confidence.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  whileHover={{ y: -4, scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-sm leading-6 text-slate-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)' }}
            className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50/80 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(123,47,247,0.12),transparent_42%)]" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
                  Minimal practice
                </span>
                <span className="text-sm font-medium text-slate-500">Instant feedback</span>
              </div>

              <div className="space-y-3">
                <h4 className="text-2xl font-semibold text-slate-900">Focused prep, clearer progress.</h4>
                <p className="text-sm leading-6 text-slate-600">
                  Each session is designed to feel calm and practical, so students can improve quickly without the noise.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-3xl font-semibold text-primary">98%</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pass focus</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-3xl font-semibold text-primary">24/7</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Flexible access</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
