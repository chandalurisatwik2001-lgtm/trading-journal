import React, { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import Navbar from './Navbar';
import Hero from './Hero';
import BentoGrid from './BentoGrid';
import Features from './Features';
import Pricing from './Pricing';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-purple-500 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <BentoGrid />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
