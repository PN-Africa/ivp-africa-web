'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  // New icons for the job/recruitment services
  FaSearch,
  FaClipboardList,
  FaBriefcase,
  FaBuilding,
  FaShieldAlt,
  FaBell,
  // Original fallback icons
  FaBrain, 
  FaCode, 
  FaPalette, 
  FaLayerGroup, 
  FaMobileAlt, 
  FaUsers, 
  FaDatabase, 
  FaServer, 
  FaRobot 
} from 'react-icons/fa';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import SectionHeading from '../common/SectionHeading';
import { SERVICES } from '../../utils/constants';

// Complete icon map covering job platform features and fallbacks
const iconMap: Record<string, React.ElementType> = {
  // Job Platform specific mappings
  'search': FaSearch,
  'clipboard-list': FaClipboardList,
  'briefcase': FaBriefcase,
  'building': FaBuilding,
  'shield-check': FaShieldAlt,
  'bell': FaBell,
  
  // Existing fallbacks
  brain: FaBrain,
  code: FaCode,
  palette: FaPalette,
  layout: FaLayerGroup,
  smartphone: FaMobileAlt,
  mobile: FaMobileAlt,
  users: FaUsers,
  database: FaDatabase,
  server: FaServer,
  robot: FaRobot,
};

const ServicesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useScrollAnimation(sectionRef);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section 
      ref={sectionRef} 
      id="services" 
      // Fluid padding: smaller on mobile, larger on desktop
      className="bg-white px-4 sm:px-8 lg:px-20 py-12 md:py-16 lg:py-24 w-full"
    >
      {/* Centered container with max-width for ultra-wide screens */}
      <div className="max-w-7xl mx-auto w-full">
        
        <SectionHeading
          className="text-gray-900"
          title="Services We Offer"
          subtitle="From development to design, we provide comprehensive opportunities to bring your vision to life."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          // Responsive grid and gaps
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-12"
        >
          {SERVICES.map((service, index) => {
            // Safe fallback to FaCode if an unmapped string is passed or icon is undefined
            const Icon = (service.icon && iconMap[service.icon]) ? iconMap[service.icon] : FaCode;

            return (
              <motion.div
                key={service.id ? `${service.id}-${index}` : `service-${index}`}
                variants={itemVariants}
                // Added flex-col and h-full to make all cards equal height
                className="group bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#8c52ff]/10 hover:border-[#8c52ff]/30 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col h-full"
              >
                {/* Icon Container - slightly smaller on mobile */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 group-hover:bg-[#8c52ff]/10 border border-gray-100 group-hover:border-[#8c52ff]/20 rounded-xl flex items-center justify-center mb-5 sm:mb-6 transition-colors duration-300">
                  <Icon className="text-xl sm:text-2xl text-gray-400 group-hover:text-[#8c52ff] transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#8c52ff] mb-3 sm:mb-4 transition-colors duration-300">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-500 group-hover:text-gray-700 mb-6 transition-colors duration-300 leading-relaxed">
                  {service.description}
                </p>

                {/* Features - mt-auto pushes this list to the bottom of the card */}
                <ul className="space-y-2.5 mt-auto pt-4 border-t border-gray-50">
                  {service.features?.slice(0, 4).map((feature, featureIdx) => (
                    <li
                      key={`${service.id || index}-feat-${featureIdx}`}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-500 group-hover:text-gray-800 transition-colors duration-300"
                    >
                      {/* Optional: Add a small checkmark or bullet point before features */}
                      <span className="text-[#8c52ff] mt-0.5 opacity-70">✦</span>
                      <span className="flex-1 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
        
      </div>
    </section>
  );
};

export default ServicesSection;