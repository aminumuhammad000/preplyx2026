import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Subjects from './components/Subjects';
import Statistics from './components/Statistics';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div className="font-sans text-text-dark bg-background min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Subjects />
      <Statistics />
      <Testimonials />
      <CTA />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
