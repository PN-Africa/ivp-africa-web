'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
  FaClipboardList,
  FaBriefcase,
  FaBuilding,
  FaShieldAlt,
  FaBell,
  FaPalette,
  FaLayerGroup,
  FaMobile,
  FaUsers,
  FaServer,
  FaDatabase,
  FaSearch,
  FaQuestionCircle,
  FaBrain, 
  FaCode,
} from 'react-icons/fa';
import Button from '../components/common/Button';
import { SERVICES } from '../utils/constants';
import type { Service } from '../types';

// Expanded icon map to catch more potential service string names
const iconMap: Record<string, React.ElementType> = {
  brain: FaBrain,
  ai: FaBrain,
  code: FaCode,
  web: FaCode,
  palette: FaPalette,
  design: FaPalette,
  ui: FaPalette,
  ux: FaPalette,
  layout: FaLayerGroup,
  fullstack: FaLayerGroup,
  smartphone: FaMobile,
  mobile: FaMobile,
  app: FaMobile,
  users: FaUsers,
  server: FaServer,
  backend: FaServer,
  database: FaDatabase,
  seo: FaSearch
};

// Helper function to intelligently match the service to an icon
const getServiceIcon = (service: Service) => {
  if (service?.icon) {
    const iconKey = service.icon.toLowerCase().trim();
    if (iconMap[iconKey]) return iconMap[iconKey];
  }

  if (service?.title) {
    const title = service.title.toLowerCase();
    if (title.includes('ai') || title.includes('company') || title.includes('bot') || title.includes('agent')) return FaBuilding;
    if (title.includes('web') || title.includes('front') || title.includes('employers')) return FaShieldAlt;
    if (title.includes('mobile') || title.includes('app') || title.includes('ios') || title.includes('android')) return FaClipboardList;
    if (title.includes('back') || title.includes('api') || title.includes('notification') || title.includes('architecture')) return FaBell;
    if (title.includes('data') || title.includes('cloud')) return FaDatabase;
    if (title.includes('consult') || title.includes('posting') || title.includes('suite')) return FaBriefcase;
    if (title.includes('seo') || title.includes('search')) return FaSearch;
  }

  return FaQuestionCircle;
};

const ServicesPage: React.FC = () => {
  const processSteps = [
    {
      step: '01',
      title: 'Smart job search',
      description: 'Effortlessly filter opportunities by role, location, and industry to discover the perfect match for your career trajectory.',
    },
    {
      step: '02',
      title: 'Apply',
      description: 'Present your skills and experience to prospective employers through a streamlined, intuitive application process.',
    },
    {
      step: '03',
      title: 'Interview',
      description: 'Connect directly with hiring teams to showcase your expertise and ensure mutual alignment on goals and culture.',
    },
    {
      step: '04',
      title: 'Acceptance',
      description: 'Review your offer, confidently finalize terms, and seamlessly transition into your next great professional chapter.',
    },
  ];

  const safeServices = Array.isArray(SERVICES) ? SERVICES : [];

  return (
    <>
      {/* Hero Section */}
      <section className="px-4 sm:px-8 lg:px-20 py-24 md:py-32 lg:py-40 bg-gradient-to-b from-[#8c52ff] to-white text-black relative overflow-hidden min-h-[60vh] flex items-center">
        {/* Subtle Decorative Glow */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#8c52ff] opacity-20 blur-[80px] md:blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-[#8c52ff] opacity-10 blur-[60px] md:blur-[100px] rounded-full pointer-events-none"></div>

        <div className="section-container text-center relative z-10 mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight">
              Services We <span className="text-[#8c52ff]">Offer</span>
            </h1>
            <p className="text-black/60 text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-10 leading-relaxed px-4">
              Providing a comprehensive suite of services to empower your career journey and streamline 
              the hiring process for employers across Africa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 sm:px-8 lg:px-20 py-12 md:py-20 bg-white">
        <div className="section-container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {safeServices.map((service, index) => {
              const Icon = getServiceIcon(service);

              return (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-100 p-6 sm:p-8 text-black shadow-lg rounded-2xl group hover:bg-[#8c52ff]/10 hover:border-[#8c52ff]/30 transition-all duration-500 ease-in-out cursor-pointer flex flex-col h-full"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 text-[#8c52ff] flex items-center justify-center rounded-xl mb-6 sm:mb-8 group-hover:bg-[#8c52ff] group-hover:text-white transition-colors duration-500 shadow-sm">
                    <Icon className="text-2xl sm:text-3xl" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4 group-hover:text-[#8c52ff] transition-colors duration-500">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 mb-6 sm:mb-8 transition-colors duration-500 flex-grow leading-relaxed text-sm sm:text-base">
                    {service.description}
                  </p>

                  <ul className="space-y-3 sm:space-y-4 mb-2">
                    {service.features?.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-gray-700 font-medium group-hover:text-black transition-colors duration-500 text-sm sm:text-base"
                      >
                        <span className="text-[#8c52ff] mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-4 sm:px-8 lg:px-20 py-16 md:py-24 bg-gray-50 relative">
        <div className="section-container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black mb-4">Work Process</h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4">
              A structured approach to ensure a successful job application every time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 -z-10"></div>
            
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative inline-block mb-6 group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-gray-200 text-gray-400 group-hover:border-[#8c52ff] group-hover:text-[#8c52ff] rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold transition-all duration-300 shadow-sm group-hover:shadow-md bg-clip-padding">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-black mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed px-2">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Stats CTA */}
      <section className="px-4 sm:px-8 lg:px-20 py-16 md:py-24 bg-white text-black">
        <div className="section-container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-6 leading-tight">
                Ready to Start Your Application?
              </h2>
              <p className="text-gray-600 text-base md:text-lg lg:text-xl mb-8 md:mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Want to discuss, or create something amazing together?
                We are available whenever you need us.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Button
                  href='/contact'
                  external
                  variant="secondary"
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 hover:text-white transition-colors duration-300 px-8 py-3.5 rounded-full font-bold w-full sm:w-auto text-center"
                >
                  Contact Us
                </Button>
                <Button 
                  href="/signUp" 
                  variant="outline" 
                  size="lg" 
                  className="bg-transparent border-2 border-black text-black hover:bg-black hover:text-white transition-colors duration-300 px-8 py-3.5 rounded-full font-bold w-full sm:w-auto text-center"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3 sm:gap-6"
            >
              <div className="bg-black rounded-2xl p-6 sm:p-8 text-center shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-transform duration-300">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">50k+</p>
                <p className="text-[#8c52ff] font-bold uppercase tracking-wider text-[10px] sm:text-xs lg:text-sm">Testimonials</p>
              </div>
              <div className="bg-black rounded-2xl p-6 sm:p-8 text-center shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-transform duration-300">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">17k+</p>
                <p className="text-[#8c52ff] font-bold uppercase tracking-wider text-[10px] sm:text-xs lg:text-sm">Clients</p>
              </div>
              <div className="bg-black rounded-2xl p-6 sm:p-8 text-center shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-transform duration-300">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">5+</p>
                <p className="text-[#8c52ff] font-bold uppercase tracking-wider text-[10px] sm:text-xs lg:text-sm">Years</p>
              </div>
              <div className="bg-black rounded-2xl p-6 sm:p-8 text-center shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-transform duration-300">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">98%</p>
                <p className="text-[#8c52ff] font-bold uppercase tracking-wider text-[10px] sm:text-xs lg:text-sm">Satisfaction</p>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;