'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { PLACEHOLDERS } from '../../utils/placeholders';

// Files inside public/assets/ are served directly from root URL '/assets/...'
const heroImage = '/assets/hero6.png';

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col">
      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">{number}</h3>
      <p className="mt-1 text-xs sm:text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

const HeroSection: React.FC = () => {
  return (
    <section className="relative flex items-center w-full min-h-[100vh] lg:min-h-[85vh] pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-20 overflow-hidden bg-[radial-gradient(circle_at_top_right,_#8c52ff_0%,_#ffffff_65%)]">
      <div className="section-container relative z-10 w-full max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 flex flex-col justify-center mt-4 lg:mt-0"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#8c52ff] font-bold md:font-medium tracking-wide mb-3 md:mb-4 uppercase text-xs sm:text-sm md:normal-case md:text-base"
            >
              A trusted talent marketplace
            </motion.p>
            
            {/* Main Heading — Scaled dynamically to prevent overflow */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[3rem] font-heading font-light lg:font-light text-black mb-5 md:mb-6 leading-[1.1] tracking-tight"
            >
              Where <span className="text-[#8c52ff]">Africa's talent</span> <br className="hidden sm:block" />meets opportunity.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-700 text-base sm:text-lg mb-8 max-w-lg leading-relaxed"
            >
              IVP Africa connects qualified candidates with employers 
              across the continent — a single, trusted place to hire, 
              get hired, and grow.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row flex-wrap gap-4 mb-10 md:mb-12"
            >
              <Button
                href="/signUp"
                external
                variant="outline"
                size="md"
                className="w-full sm:w-auto justify-center text-black bg-transparent border-2 border-black transition-all duration-300 py-3.5 px-6 font-semibold"
              >
                I'm looking for a job
              </Button>
              <Button 
                href="/signUp" 
                variant="outline" 
                size="md" 
                className="w-full sm:w-auto justify-center bg-white text-black border-2 border-black transition-all duration-300 py-3.5 px-6 font-semibold"
              >
                I'm hiring talent
              </Button>
            </motion.div>
            
            {/* Stats Grid - Using grid ensures better mobile alignment */}
            <div className="pt-8 border-t border-gray-200/60 grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
              <Stat number="12k+" label="Verified candidates" />
              <Stat number="850+" label="Employers hiring" />
              <Stat number="34" label="Countries" />
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end w-full"
          >
            <div className="relative w-full max-w-[280px] sm:max-w-md lg:max-w-lg xl:max-w-xl flex justify-center">
              {/* Background Glow Decorations */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-[400px] md:h-[400px] bg-[#8c52ff]/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-4 -right-4 w-40 h-40 md:w-80 md:h-80 bg-gray-400/20 rounded-full blur-2xl -z-10" />
              
              {/* Main Image */}
              <div className="relative z-10 w-full aspect-square rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl lg:shadow-none border border-white/20 lg:border-none">
                <img
                  src={heroImage}
                  alt="IVP Africa Hero"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = PLACEHOLDERS.hero;
                  }}
                />
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;