import { Mail } from 'lucide-react';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.638 7.584H.876l8.6-9.823L0 1.153h7.594l5.243 6.932L18.901 1.153Zm-1.03 19.03h1.136L6.17 3.15H4.95l12.92 17.033Z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M13.5 22v-9h3l.45-3.5H13.5V4.2c0-1.01.28-1.7 1.73-1.7H18V.1C17.37.05 16.21 0 14.95 0c-2.43 0-4.1 1.48-4.1 4.2V9.5H7.5V13h3.35v9h2.65Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#1a053a] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-6">
              <img src="a.jpg" alt="Preplyx" className="h-12 w-auto bg-white rounded-lg p-1" />
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The smartest way to prepare for WAEC, NECO, and JAMB. Join thousands of successful students today.
            </p>
            <div className="flex gap-4">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <XIcon />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <FacebookIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a></li>
              <li><a href="#subjects" className="text-gray-400 hover:text-white transition-colors text-sm">Subjects</a></li>
              <li><a href="#cta" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a></li>
              <li><a href="#cta" className="text-gray-400 hover:text-white transition-colors text-sm">Download App</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a></li>
              <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
              <li><a href="mailto:hello@preplyx.com" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors text-sm">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                hello@preplyx.com
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                All systems operational
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Preplyx Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
