'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const PortfolioSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useScrollAnimation(sectionRef);

  const row1Countries = [
    "Nigeria", "South Africa", "Kenya", "Egypt", "Ghana", 
    "Morocco", "Ethiopia", "Tanzania", "Senegal", "Uganda",
    "Rwanda", "Zimbabwe", "Ivory Coast", "Cameroon", "Botswana",
    "Namibia", "Zambia", "Angola", "Mozambique", "Mali"
  ];

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      // Responsive vertical padding based on screen size
      className="py-4 sm:py-6 lg:py-8 bg-black border-y border-white/10 overflow-hidden relative flex items-center"
    >
      {/* Responsive edge gradients: smaller on mobile to prevent obscuring too much text */}
      <div className="absolute inset-y-0 left-0 w-12 sm:w-20 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 sm:w-20 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full relative"
      >
        <Marquee 
          speed={50} 
          gradient={false} 
          pauseOnHover={true}
          className="overflow-hidden flex items-center"
        >
          {row1Countries.map((country, index) => (
            <div key={index} className="flex items-center group cursor-pointer">
              <span className="text-white/80 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider md:tracking-widest px-4 sm:px-6 md:px-8 transition-colors duration-300 group-hover:text-[#8c52ff] group-hover:drop-shadow-[0_0_8px_rgba(140,82,255,0.5)] whitespace-nowrap">
                {country}
              </span>
              {/* Decorative premium separator - flex-shrink-0 prevents distortion */}
              <span className="text-[#8c52ff] text-base sm:text-xl lg:text-2xl opacity-60 flex-shrink-0">
                ✦
              </span>
            </div>
          ))}
        </Marquee>
      </motion.div>
    </section>
  );
};

export default PortfolioSection;