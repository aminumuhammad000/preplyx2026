import { motion } from 'framer-motion';
import { BookOpen, Award, CheckCircle2, ArrowRight, Monitor, GraduationCap, Flame } from 'lucide-react';

const EXAM_CARDS = [
  {
    id: "jamb",
    title: "JAMB UTME CBT Simulator",
    badge: "Most Popular",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    icon: Monitor,
    iconColor: "text-primary bg-primary/10",
    description: "Full real-time JAMB exam environment with official timer, 4-subject combinations, automatic score calculation out of 400, and instant score slip.",
    highlights: [
      "Real CBT Interface & Keyboard Shortcuts",
      "Full 4-Subject UTME Mock Tests",
      "Instant Score Prediction & Percentile Rank",
      "Step-by-Step Solution Explanations"
    ],
    stats: "300+ Target Score",
    color: "from-primary/5 to-secondary/5",
    border: "border-primary/20 hover:border-primary/40"
  },
  {
    id: "waec",
    title: "WAEC SSCE Prep Vault",
    badge: "Curriculum Aligned",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: GraduationCap,
    iconColor: "text-emerald-600 bg-emerald-50",
    description: "Master Senior Secondary Certificate Examinations with comprehensive objective practice, theory breakdowns, and detailed diagram explanations.",
    highlights: [
      "Year-by-Year Past Questions (2000 - 2025)",
      "Detailed Diagrams & Step-by-Step Math Solutions",
      "Topic-by-Topic Mastery Tracking",
      "WAEC Grading Scheme Alignment"
    ],
    stats: "Aim for A1 Grades",
    color: "from-emerald-500/5 to-teal-500/5",
    border: "border-emerald-200 hover:border-emerald-400"
  },
  {
    id: "neco",
    title: "NECO SSCE Excellence Pack",
    badge: "Speed & Accuracy",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Flame,
    iconColor: "text-amber-600 bg-amber-50",
    description: "Sharpen your speed and accuracy with timed mock drills designed specifically for National Examinations Council (NECO) standards.",
    highlights: [
      "Speed Drills & Time-Management Analytics",
      "Weakness Identification & Focus Mode",
      "All Major Science, Arts & Commercial Subjects",
      "Unlimited Practice Attempts"
    ],
    stats: "100% Exam Readiness",
    color: "from-amber-500/5 to-orange-500/5",
    border: "border-amber-200 hover:border-amber-400"
  }
];

const SUBJECT_TAGS = [
  "Mathematics", "English Language", "Physics", "Chemistry", 
  "Biology", "Economics", "Government", "Literature-in-English",
  "Commerce", "Financial Accounting", "CRK/IRS", "Agricultural Science"
];

const Exams = () => {
  return (
    <section id="exams" className="py-12 bg-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5" />
            CBT Exam Suite
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Built for Nigeria's Top National Exams
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Simulate real exam conditions with authentic past questions, time limits, and intelligent performance insights.
          </p>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {EXAM_CARDS.map((exam, idx) => {
            const Icon = exam.icon;
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className={`bg-gradient-to-b ${exam.color} bg-white border ${exam.border} rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative group`}
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3 rounded-xl ${exam.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${exam.badgeColor}`}>
                      {exam.badge}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {exam.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {exam.description}
                  </p>

                  {/* Highlights List */}
                  <div className="space-y-2.5 mb-6 pt-2">
                    {exam.highlights.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Footer Action */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    {exam.stats}
                  </span>
                  <a 
                    href="https://dash.preplyx.com.ng"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:text-secondary transition-colors"
                  >
                    <span>Practice Now</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comprehensive Subject Coverage Strip */}
        <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-6 text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-500">
              Full Coverage Across All Major Subjects
            </h4>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {SUBJECT_TAGS.map((subject, i) => (
              <span 
                key={i} 
                className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-2xs hover:border-primary hover:text-primary transition-colors cursor-default"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Exams;
