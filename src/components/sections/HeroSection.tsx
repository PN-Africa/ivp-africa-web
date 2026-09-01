'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { CONTACT_INFO } from '../../utils/constants';
import { PLACEHOLDERS } from '../../utils/placeholders';

// Files inside public/assets/ are served directly from root URL '/assets/...'
const heroImage = '/assets/hero6.png';

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col">
      <h3 className="text-3xl font-serif font-bold text-gray-900">{number}</h3>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

const HeroSection: React.FC = () => {
  return (
    <section className="flex items-center min-w-full min-h-[80vh] pt-40 px-20 py-30 pb-16 lg:pt-25 lg:pb-24 overflow-hidden bg-[radial-gradient(circle_at_top_right,_#8c52ff_0%,_#ffffff_65%)]">
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 flex flex-col justify-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#8c52ff] font-medium mb-4"
            >
              A trusted talent marketplace
            </motion.p>
            
            {/* Main Heading — Increased responsive font sizes and added leading-[1.05] */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[9.5rem] font-heading font-light text-black mb-5 leading-[1.05]"
            >
              Where <span className="text-[#8c52ff]">Africa's talent</span> <br />meets opportunity.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-grayDark text-lg mb-8 max-w-lg"
            >
              IVP Africa connects qualified candidates with employers 
              across the continent — a single, trusted place to hire, 
              get hired, and grow.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Button
                href="/signUp"
                external
                variant="outline"
                size="md"
                className="text-black bg-transparent hover:text-black border-2 border-black transition-all duration-300"
              >
                I'm looking for a job
              </Button>
              <Button 
                href="/signUp" 
                variant="outline" 
                size="md" 
                className="bg-black text-black hover:bg-transparent hover:text-black border-2 border-black transition-all duration-300"
              >
                I'm hiring talent
              </Button>
            </motion.div>
            
            <div className="pt-8 border-t border-gray-200 flex flex-wrap gap-8 md:gap-12">
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
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md lg:max-w-md flex justify-center">
              {/* Background Glow Decorations */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-[400px] md:h-[400px] bg-[#8c52ff]/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-6 -right-6 w-56 h-56 md:w-80 md:h-80 bg-gray-400/20 rounded-full blur-2xl -z-10" />
              
              {/* Main Image */}
              <div className="relative z-10 w-full aspect-[4/4] rounded-[2rem] overflow-hidden border-none border-white/50">
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