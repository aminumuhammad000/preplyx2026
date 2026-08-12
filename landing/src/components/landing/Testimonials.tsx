import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "I improved my JAMB score from 180 to 278 using Preplyx. The detailed explanations for each question made a huge difference in my confidence.",
    author: "Amina B.",
    location: "Kano",
    rating: 5
  },
  {
    quote: "The CBT practice helped me become much faster during the exam. The interface felt identical to the actual JAMB computer test.",
    author: "David O.",
    location: "Abuja",
    rating: 5
  },
  {
    quote: "Being able to download questions and practice offline saved me so much mobile data while studying for my WAEC examinations.",
    author: "Chidera E.",
    location: "Lagos",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Trusted by Nigerian Students
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Real feedback from students who built confidence and scored higher with Preplyx.
          </p>
        </div>

        {/* Minimalist 3-Card Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -3 }}
              className="bg-white border border-gray-200/80 rounded-xl p-7 flex flex-col justify-between hover:border-gray-300 transition-colors duration-200"
            >
              <div>
                {/* 5-Star Rating */}
                <div className="flex gap-1 mb-5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{item.author}</h3>
                  <p className="text-xs text-gray-500 font-medium">{item.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
