import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';

const QUESTIONS = [
  {
    subject: "JAMB English",
    question: "Choose the word most opposite in meaning to the capitalized word: The effect of the drug was EPHEMERAL.",
    options: ["Transient", "Permanent", "Short-lived", "Deliberate"],
    correct: 1,
    explanation: "Ephemeral means lasting for a very short time. The correct opposite is 'Permanent'."
  },
  {
    subject: "WAEC Biology",
    question: "Which of the following cell organelles is responsible for cellular respiration?",
    options: ["Chloroplast", "Nucleus", "Mitochondrion", "Ribosome"],
    correct: 2,
    explanation: "Mitochondria are the powerhouses of the cell, where ATP is generated via respiration."
  },
  {
    subject: "JAMB Mathematics",
    question: "If log₁₀(x²) = 2, what is the value of x?",
    options: ["2", "10", "20", "100"],
    correct: 1,
    explanation: "log₁₀(x²) = 2 means x² = 10² = 100, which gives x = 10."
  }
];

const Hero = () => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const currentQ = QUESTIONS[currentQIndex];

  const handleOptionClick = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setAnswered(false);
    setCurrentQIndex((prev) => (prev + 1) % QUESTIONS.length);
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center bg-background">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Headline & Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 pr-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Practice Smarter, Score Higher
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-dark leading-[1.15] mb-6">
              Master WAEC, NECO & JAMB with <span className="text-gradient">confidence</span>.
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              Get instant access to thousands of real past questions, detailed step-by-step explanations, and real-time performance analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#subjects" className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-300 shadow-[0_4px_12px_rgba(75,15,163,0.2)] hover:shadow-[0_8px_20px_rgba(123,47,247,0.3)] hover:-translate-y-0.5">
                Start Practicing <ChevronRight className="w-4 h-4" />
              </a>
              <a href="#cta" className="flex items-center justify-center gap-2 bg-white text-text-dark border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-base transition-all duration-300 shadow-sm">
                Explore Subjects
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Supported Exams:</span>
              <div className="flex gap-2">
                {["JAMB", "WAEC", "NECO"].map((exam) => (
                  <span key={exam} className="text-xs font-extrabold text-gray-600 bg-white border border-gray-150 px-3 py-1 rounded-full shadow-xs">
                    {exam}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Interactive Quiz Widget (Instant Feedback) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 w-full max-w-md mx-auto"
          >
            <div className="glass-card bg-white/70 backdrop-blur-xl border border-gray-250/20 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-350 hover:shadow-2xl">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary uppercase tracking-widest">
                  {currentQ.subject}
                </span>
                <span className="text-xs font-bold text-gray-500">
                  Interactive Demo
                </span>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 text-base leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, idx) => {
                  let optionClass = "border-gray-200 bg-white hover:border-primary hover:bg-primary/5 text-gray-700";
                  let Icon = null;
                  
                  if (answered) {
                    if (idx === currentQ.correct) {
                      optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold shadow-xs";
                      Icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
                    } else if (selectedOption === idx) {
                      optionClass = "border-rose-500 bg-rose-50 text-rose-800 font-semibold shadow-xs";
                      Icon = <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
                    } else {
                      optionClass = "border-gray-150 bg-gray-50/50 text-gray-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={answered}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${optionClass}`}
                    >
                      <span>{option}</span>
                      {Icon}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Trigger */}
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-150 text-xs text-gray-600 mb-4">
                      <p className="font-bold text-gray-700 mb-1">
                        {selectedOption === currentQ.correct ? "🎉 Correct!" : "❌ Incorrect"}
                      </p>
                      <p className="leading-relaxed">{currentQ.explanation}</p>
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="w-full flex items-center justify-center gap-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 text-xs font-bold transition-all"
                    >
                      Try Another Question <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
