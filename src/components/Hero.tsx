import { motion } from 'framer-motion';
import { Download, ChevronRight, Award, BookOpen, TrendingUp } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center bg-background">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Built for Nigerian Students
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-text-dark leading-[1.1] mb-6">
              Pass WAEC, NECO & JAMB With <span className="text-gradient">Real Past Questions</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
              Practice thousands of verified exam questions, study smarter, and boost your confidence before exams.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-[0_8px_20px_rgba(75,15,163,0.3)] hover:shadow-[0_12px_25px_rgba(123,47,247,0.4)] hover:-translate-y-1">
                Start Practicing <ChevronRight className="w-5 h-5" />
              </button>
              <button className="flex items-center justify-center gap-2 bg-white text-text-dark border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-sm hover:shadow-md">
                <Download className="w-5 h-5" /> Download App
              </button>
            </div>

            <div className="flex items-center gap-6 text-gray-500 font-medium">
              <span className="text-sm uppercase tracking-wider font-bold">Trusted for:</span>
              <div className="flex gap-4 items-center">
                <span className="px-3 py-1 rounded bg-gray-100 font-bold text-gray-700">WAEC</span>
                <span className="px-3 py-1 rounded bg-gray-100 font-bold text-gray-700">NECO</span>
                <span className="px-3 py-1 rounded bg-gray-100 font-bold text-gray-700">JAMB</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visuals */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Main App Mockup Card */}
            <div className="absolute z-20 w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    A
                  </div>
                  <div>
                    <p className="font-bold text-sm">Welcome back, Amina</p>
                    <p className="text-xs text-gray-500">Ready to crush JAMB?</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">278</p>
                  <p className="text-xs text-gray-500">Target Score</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-background rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Use of English</h4>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-500">85%</span>
                </div>

                <div className="bg-background rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Mathematics</h4>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-500">60%</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-gray-900 text-white rounded-xl py-3 text-sm font-bold hover:bg-gray-800 transition-colors">
                Continue Practice Session
              </button>
            </div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 z-30 glass-card rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white shadow-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Performance</p>
                <p className="font-bold text-sm text-text-dark">+24% this week</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-8 z-30 glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs font-bold">"Best CBT App!"</p>
            </motion.div>
            
            {/* Decorative background shape for the mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-primary/10 to-secondary/20 rounded-full blur-2xl -z-10" />

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
