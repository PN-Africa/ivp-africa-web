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
import { SERVICES, CONTACT_INFO } from '../utils/constants';
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
  // 1. Try to match the provided icon string exactly
  if (service?.icon) {
    const iconKey = service.icon.toLowerCase().trim();
    if (iconMap[iconKey]) return iconMap[iconKey];
  }

  // 2. Fallback: Infer the best icon from the service title
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

  // 3. Ultimate fallback if nothing matches
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

  // Safety Check: If SERVICES is undefined, don't try to map over it.
  const safeServices = Array.isArray(SERVICES) ? SERVICES : [];

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding px-20 py-40 bg-gradient-to-b from-[#8c52ff] to-white text-black relative overflow-hidden min-h-[60vh] flex items-center">
        {/* Subtle Decorative Glow using the allowed purple */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8c52ff] opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8c52ff] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="section-container text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight">
              Services We <span className="text-[#8c52ff]">Offer</span>
            </h1>
            <p className="text-black/50 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              From AI-powered solutions to stunning web applications and creative designs,
              we provide comprehensive services to transform your ideas into reality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding px-20 py-20 bg-white border-none border-black/50">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeServices.map((service, index) => {
              // Now dynamically and safely getting the most representative icon
              const Icon = getServiceIcon(service);

              return (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white border-none border-black/50 p-8 text-black shadow-lg rounded-2xl group hover:bg-[#8c52ff]/30 transition-all duration-500 ease-in-out cursor-pointer flex flex-col h-full"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-xl mb-8 transition-colors duration-500 shadow-sm">
                    <Icon className="text-3xl" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-black mb-4 transition-colors duration-500">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-black/70 mb-8 transition-colors duration-500 flex-grow leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {service.features?.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-black font-medium group-hover:text-white transition-colors duration-500"
                      >
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
      <section className="section-padding px-30 py-30 bg-white relative">
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">Work Process</h2>
            <p className="text-black/70 text-lg max-w-2xl mx-auto">
              A structured approach to ensure successful job application every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden lg:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-black/10 -z-10"></div>
            
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative inline-block mb-8 group">
                  <div className="w-24 h-24 bg-white border-2 border-black/50 text-black group-hover:border-[#8c52ff] group-hover:text-[#8c52ff] rounded-full flex items-center justify-center text-3xl font-bold transition-colors duration-300 bg-clip-padding">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-sans text-black mb-4">{step.title}</h3>
                <p className="text-black/70 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Stats CTA */}
      <section className="section-padding px-20 py-20 bg-white text-black">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                Ready to Start Your Application?
              </h2>
              <p className="text-black/50 text-xl mb-10 leading-relaxed">
                Want to discuss?, or create something amazing together.
                We are available whenever you need us.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  href= '/contact'
                  external
                  variant="secondary"
                  size="lg"
                  className="bg-black text-black border-2 border-black  transition-colors duration-300 px-8 font-bold"
                >
                  Contact Us
                </Button>
                <Button 
                  href="/signUp" 
                  variant="outline" 
                  size="lg" 
                  className="bg-transparent border-2 border-black text-black transition-colors duration-300 px-8 font-bold"
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
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-black rounded-2xl p-8 text-center shadow-2xl hover:-translate-y-2 transition-transform duration-300 border border-white/10">
                <p className="text-5xl font-black text-white mb-3 tracking-tighter">50000+</p>
                <p className="text-[#8c52ff] font-bold uppercase tracking-wider text-sm">Testimonials</p>
              </div>
              <div className="bg-black rounded-2xl p-8 text-center shadow-2xl hover:-translate-y-2 transition-transform duration-300 border border-white/10">
                <p className="text-5xl font-black text-white mb-3 tracking-tighter">17000+</p>
                <p className="text-[#8c52ff] font-bold uppercase tracking-wider text-sm">Clients</p>
              </div>
              <div className="bg-black rounded-2xl p-8 text-center shadow-2xl hover:-translate-y-2 transition-transform duration-300 border border-white/10">
                <p className="text-5xl font-black text-white mb-3 tracking-tighter">5+</p>
                <p className="text-[#8c52ff] font-bold uppercase tracking-wider text-sm">Years</p>
              </div>
              <div className="bg-black rounded-2xl p-8 text-center shadow-2xl hover:-translate-y-2 transition-transform duration-300 border border-white/10">
                <p className="text-5xl font-black text-white mb-3 tracking-tighter">98%</p>
                <p className="text-[#8c52ff] font-bold uppercase tracking-wider text-sm">Satisfaction</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;
