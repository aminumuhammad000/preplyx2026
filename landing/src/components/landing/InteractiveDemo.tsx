import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Award } from 'lucide-react';

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

const InteractiveDemo = () => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const currentQ = QUESTIONS[currentQIndex];

  const handleOptionClick = (index: number) => {
    if (answered) return;
    setSelectedOption(index);
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setAnswered(false);
    setCurrentQIndex((prev) => (prev + 1) % QUESTIONS.length);
  };

  return (
    <section id="practice" className="py-12 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Practice Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Test Your Knowledge in Real Time
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Experience how our real-time question engine gives immediate feedback, step-by-step explanations, and detailed solution breakdowns.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-150">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
                  {currentQ.subject}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Question {currentQIndex + 1} of {QUESTIONS.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Award className="w-3.5 h-3.5" />
                <span>Instant Score Feedback</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, idx) => {
                let optionClass = "border-gray-200 bg-white hover:border-primary hover:bg-primary/5 text-gray-700 shadow-2xs";
                let Icon = null;
                
                if (answered) {
                  if (idx === currentQ.correct) {
                    optionClass = "border-emerald-500 bg-emerald-50/90 text-emerald-900 font-semibold shadow-xs";
                    Icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
                  } else if (selectedOption === idx) {
                    optionClass = "border-rose-500 bg-rose-50/90 text-rose-900 font-semibold shadow-xs";
                    Icon = <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
                  } else {
                    optionClass = "border-gray-200 bg-gray-50/50 text-gray-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={answered}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-sm sm:text-base font-medium transition-all duration-200 ${optionClass}`}
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
                  <div className={`rounded-xl p-4 border text-xs sm:text-sm mb-5 ${
                    selectedOption === currentQ.correct 
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    <p className="font-bold mb-1 flex items-center gap-1.5">
                      {selectedOption === currentQ.correct ? "🎉 Correct Answer!" : "❌ Incorrect Answer"}
                    </p>
                    <p className="leading-relaxed opacity-90">{currentQ.explanation}</p>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white rounded-xl py-3.5 text-sm font-semibold transition-all shadow-md shadow-primary/20 hover:shadow-lg"
                  >
                    <span>Try Another Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
