import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Exams & CBT', href: '#exams' },
    { name: 'Practice Demo', href: '#practice' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[92%] max-w-6xl rounded-full backdrop-blur-md ${isScrolled ? 'top-3 bg-white/95 shadow-[0_10px_40px_rgba(15,23,42,0.06)] py-2.5 px-6' : 'top-6 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.05)] py-3.5 px-8'}`}>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center gap-2">
              <img src="/images/a.png" alt="Preplyx" className="h-10 w-auto rounded-full object-cover shadow-sm transition-transform duration-300 hover:scale-105" />
            </a>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-gray-600 hover:text-primary transition-colors font-medium">
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <a href="#cta" className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 inline-block">
              Get Started
            </a>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-3 mx-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 md:hidden z-[70]"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <img src="/images/a.png" alt="Preplyx" className="h-9 w-auto rounded-full" />
                  <span className="font-bold text-gray-900 text-lg">Preplyx</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-lg font-semibold text-gray-700 hover:text-primary transition-colors py-1"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <a
                  href="#cta"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-primary hover:bg-secondary text-white text-center py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98]"
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
