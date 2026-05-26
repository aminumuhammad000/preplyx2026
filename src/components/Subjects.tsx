import { motion } from 'framer-motion';

const Subjects = () => {
  const subjects = [
    "Mathematics", "English", "Biology", "Chemistry", 
    "Physics", "Economics", "Government", "Literature"
  ];

  return (
    <section id="subjects" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Comprehensive Coverage</h2>
          <h3 className="text-4xl font-extrabold text-text-dark mb-6">All Your Subjects in One Place</h3>
          <p className="text-lg text-gray-600">
            Practice past questions across all major subjects required for WAEC, NECO, and JAMB.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="relative group cursor-pointer"
            >
              {/* Gradient border wrapper */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-50 group-hover:opacity-100 blur-[2px] transition-opacity duration-300"></div>
              
              <div className="relative bg-white px-8 py-4 rounded-full border border-gray-100 flex items-center justify-center m-[2px]">
                <span className="font-bold text-text-dark group-hover:text-primary transition-colors">
                  {subject}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Subjects;
