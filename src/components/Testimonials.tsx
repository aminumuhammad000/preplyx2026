import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Amina",
      location: "Kano",
      quote: "I improved my JAMB score from 180 to 278 using Preplyx. The explanations for each question made all the difference in my preparation.",
      rating: 5,
      avatar: "A"
    },
    {
      name: "David",
      location: "Abuja",
      quote: "The CBT practice helped me become faster during exams. It felt exactly like the real JAMB interface. Highly recommend to every student!",
      rating: 5,
      avatar: "D"
    },
    {
      name: "Chidera",
      location: "Lagos",
      quote: "I love that I can download questions and practice offline. It saved me a lot of money on data while preparing for my WAEC.",
      rating: 5,
      avatar: "C"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-background to-white pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Testimonials</h2>
            <h3 className="text-4xl font-extrabold text-text-dark mb-6">Trusted by Nigerian Students</h3>
            <p className="text-lg text-gray-600">
              Don't just take our word for it. Here is what students who used Preplyx have to say.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card bg-white p-8 rounded-3xl relative"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-8 leading-relaxed italic">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-text-dark">{testimonial.name}</h4>
                  <p className="text-xs text-gray-500">{testimonial.location}</p>
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
