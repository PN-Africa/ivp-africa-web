'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import Button from '../common/Button';
import { PLACEHOLDERS } from '../../utils/placeholders';
// This import is correct for bundling assets via Webpack/Vite
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
      className="section-padding bg-cover px-20 py-20 bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Overlay to ensure text readability over the background image */}
      <div className="absolute inset-0 bg-white/90"></div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-transparent rounded-2xl transform rotate-3" />
              
              {/* Main Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden">
                <img
                  src={aboutImage.src} // Use the imported image URL string
                  alt="IVP - About"
                  className="w-full h-auto"
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
          >
            <h2 className="text-black mb-6">About Us</h2>
            
            <p className=" text-grayDark text-lg font-bold mb-6">
              A recruitment platform built for Africa.
            </p>
            
            <p className="text-xl text-primary mb-4 flex items-center gap-2">
              Everything you need to place great people in great roles — profiles, 
              search, applications, subscriptions, and admin. No noise.
            </p>
            <p className="text-xl text-primary mb-4 flex items-center gap-2">
              We verify every employer, curate every listing, and give both 
              sides the tools to move quickly. What emerges is a marketplace 
              people actually stay in.
            </p>

            {/* Skills Section */}
            <div className="space-y-8 mb-8">

              <div>
                <h3 className="text-xl text-primary mb-4 flex items-center gap-2">
                  
                </h3>
                <div className="space-y-3">
                  
                </div>
              </div>
            </div>

            <Button href="/about" variant="primary" className='bg-white text-black hover:bg-white border border-black border-2'>
              Learn More About Us
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
