import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1a053a] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-primary font-bold text-xl leading-none">P</span>
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">Preplyx</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The smartest way to prepare for WAEC, NECO, and JAMB. Join thousands of successful students today.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-xs font-bold">
                X
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-xs font-bold">
                FB
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-xs font-bold">
                IG
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a></li>
              <li><a href="#subjects" className="text-gray-400 hover:text-white transition-colors text-sm">Subjects</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Download App</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Community</a></li>
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
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
