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
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">About Preplyx</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-text-dark leading-tight mb-6">
              Study Smarter, Not Harder.
            </h3>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Preplyx helps students prepare for WAEC, NECO, and JAMB using real past questions, smart practice sessions, and performance tracking. We turn anxiety into confidence.
            </p>

            <div className="grid sm:grid-cols-2 gap-8">
              {highlights.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-dark mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] rounded-3xl bg-primary-gradient p-8 shadow-2xl flex flex-col justify-center overflow-hidden"
          >
            {/* Abstract Shapes inside the card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/30 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="glass-card bg-white/10 border-white/20 text-white rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-xl mb-2">Smart Practice Sessions</h4>
                <p className="text-white/80 text-sm">Our algorithm adapts to your weaknesses and creates custom tests to improve your scores rapidly.</p>
              </div>

              <div className="flex gap-4">
                <div className="glass-card bg-white/10 border-white/20 text-white rounded-2xl p-6 flex-1">
                  <p className="text-3xl font-bold text-accent mb-1">98%</p>
                  <p className="text-xs text-white/80 uppercase tracking-wide font-medium">Pass Rate</p>
                </div>
                <div className="glass-card bg-white/10 border-white/20 text-white rounded-2xl p-6 flex-1">
                  <p className="text-3xl font-bold text-accent mb-1">24/7</p>
                  <p className="text-xs text-white/80 uppercase tracking-wide font-medium">Offline Access</p>
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
