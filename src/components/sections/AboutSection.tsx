'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import Button from '../common/Button';
import { PLACEHOLDERS } from '../../utils/placeholders';
// This import is correct for bundling assets via Webpack/Vite or Next.js static imports
import aboutImage from '../../assets/about1.png';

// Change this line to reference the image relative to the PUBLIC folder
const backgroundImage = '../../assets/.jpg'; 

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useScrollAnimation(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="About"
      className="relative bg-cover bg-center bg-no-repeat px-4 sm:px-8 lg:px-20 py-12 sm:py-16 lg:py-24 w-full overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Overlay to ensure text readability over the background image */}
      <div className="absolute inset-0 bg-white/90 z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-md mx-auto lg:max-w-none px-4 sm:px-0"
          >
            <div className="relative">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gray-100 rounded-2xl transform rotate-3 scale-105 shadow-sm" />
              
              {/* Main Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <img
                  src={aboutImage.src} // Use the imported image URL string
                  alt="IVP - About"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = PLACEHOLDERS.about;
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col text-center lg:text-left mt-6 lg:mt-0"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6">
              About Us
            </h2>
            
            <p className="text-grayDark text-lg sm:text-xl font-bold mb-4 sm:mb-6">
              A recruitment platform built for Africa.
            </p>
            
            <p className="text-base sm:text-lg lg:text-xl text-primary mb-4 sm:mb-5 leading-relaxed">
              Everything you need to place great people in great roles — profiles, 
              search, applications, subscriptions, and admin. No noise.
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-primary mb-6 sm:mb-8 leading-relaxed">
              We verify every employer, curate every listing, and give both 
              sides the tools to move quickly. What emerges is a marketplace 
              people actually stay in.
            </p>

            {/* Skills Section (Empty block preserved from original) */}
            <div className="space-y-4 sm:space-y-8 mb-6 sm:mb-8">
              <div>
                <h3 className="text-lg sm:text-xl text-primary mb-2 sm:mb-4 flex items-center justify-center lg:justify-start gap-2">
                  
                </h3>
                <div className="space-y-3">
                  
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center lg:justify-start">
              <Button 
                href="/about" 
                variant="primary" 
                className="w-full sm:w-auto bg-white text-black hover:bg-gray-50 border-2 border-black font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-all duration-300 flex justify-center items-center"
              >
                Learn More About Us
              </Button>
            </div>
            
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;