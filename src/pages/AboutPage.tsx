'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { PLACEHOLDERS } from '../utils/placeholders';
import SectionHeading from '../components/common/SectionHeading';
import Button from '../components/common/Button';

const AboutPage: React.FC = () => {
  const journey = [
    {
      year: '2023',
      title: 'The Vision Begins',
      company: 'IVP Africa',
      description: 'Recognizing the gap between African talent and global opportunities, the initial concept for a unified trust-based marketplace was born.',
    },
    {
      year: '2024',
      title: 'Strategic Partnerships',
      company: 'IVP Africa',
      description: 'Built our core verification infrastructure and successfully piloted placements with top enterprise employers across the continent.',
    },
    {
      year: 'January 2026',
      title: 'Platform Evolution',
      company: 'IVP Africa',
      description: 'Official reopening and launch of IVP V2 with advanced matching algorithms, enhanced verification, and seamless enterprise tools.',
    },
  ];

  const coreValues = [
    {
      title: 'Rigorous Verification',
      description: 'Every candidate and employer undergoes a strict vetting process to ensure only high-quality, trusted connections are made.',
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Radical Transparency',
      description: 'We eliminate the noise. Clear expectations, upfront communication, and verified credentials build a marketplace people actually stay in.',
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      title: 'Pan-African Reach',
      description: 'Access a diverse, vibrant pool of professionals and enterprise opportunities spanning the entire African continent in one unified space.',
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-[100vh] flex items-center pt-24 md:pt-32 pb-16 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-[#8c52ff] to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="section-container relative w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-12 md:mt-0">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="order-2 lg:order-1 text-center lg:text-left"
            >
              <div className="inline-block px-4 py-1.5 bg-transparent text-primary rounded-full text-sm font-semibold tracking-wide mb-6">
                About IVP Africa
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                Trust is the product. <br className="hidden md:block" />
                <span className="text-primary">Placements are the proof.</span>
              </h1>
              
              <div className="w-20 h-1.5 bg-primary mb-8 rounded-full mx-auto lg:mx-0" />
              
              <p className="text-lg md:text-xl text-grayDark leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                We bridge the gap between world-class African tech talent and global enterprises through verified credentials, transparent matching, and rapid placement.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Button
                  href="/signUp"
                  external
                  variant="primary"
                  className="bg-black text-white px-8 py-4 shadow-lg transition-all"
                >
                  I'm looking for a job
                </Button>
                <Button 
                  href="/signUp" 
                  variant="outline"
                  className="bg-black text-white px-8 py-4 shadow-lg transition-all"
                >
                  I'm hiring talent
                </Button>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="order-1 lg:order-3 relative mt-8 lg:mt-0"
            >
              <div className="relative rounded-3xl w-full max-w-md mx-auto lg:max-w-none">
                <img
                  src="/assets/africa.svg"
                  alt="IVP Team Collaboration"  
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = PLACEHOLDERS.about;
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 lg:py-24 bg-white relative">
        <div className="section-container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-grayLight/40 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xs uppercase font-bold tracking-widest text-primary mb-2 block">Driven by Purpose</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-grayDark text-base sm:text-lg leading-relaxed">
                To eliminate friction in Pan-African hiring by building a strict verification engine. We empower employers to hire with confidence and provide top-tier African talent with direct, friction-free access to high-impact global opportunities.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              viewport={{ once: true }}
              className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-grayLight/40 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-secondary" />
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-xs uppercase font-bold tracking-widest text-secondary mb-2 block">Shaping Tomorrow</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-grayDark text-base sm:text-lg leading-relaxed">
                To become Africa’s definitive talent infrastructure—the primary engine that connects millions of skilled professionals to global remote markets, setting a new global benchmark for verified remote talent distribution.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Divider Section */}
      <section className="px-6 md:px-12 lg:px-20 py-12 md:py-16 border-y border-gray-200 bg-white">
        <div className="section-container max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            {[
              { label: 'Active Professionals', value: '10k+' },
              { label: 'Verified Companies', value: '500+' },
              { label: 'Countries Reached', value: '34' },
              { label: 'Success Rate', value: '94%' }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-4">
                <h4 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">{stat.value}</h4>
                <p className="text-xs sm:text-sm font-medium text-grayDark uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 lg:py-24 bg-white">
        <div className="section-container max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <SectionHeading
              className="text-gray-900"
              title="Why Choose IVP"
              subtitle="The pillars that make our ecosystem the most trusted talent marketplace in Africa."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                className="bg-grayLight/30 p-8 rounded-2xl border border-gray-100 hover:bg-[#8c52ff]/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                  <div className="text-primary transition-colors">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-grayDark leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 lg:py-24 bg-grayLight">
        <div className="section-container max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16 text-center">
            <SectionHeading
              title="Our Journey"
              subtitle="The milestones that define our path to connecting the continent."
              className="text-black"
            />
          </div>

          <div className="max-w-3xl mx-auto px-2 sm:px-0">
            {journey.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="relative pl-8 sm:pl-10 pb-12 border-l-2 border-primary/30 last:pb-0 group"
              >
                <div className="absolute -left-[11px] top-1.5 w-5 h-5 bg-white border-4 border-primary rounded-full group-hover:scale-125 group-hover:bg-primary transition-all duration-300 shadow-sm" />
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-4">
                    {item.year}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-primary font-medium mb-4">{item.company}</p>
                  <p className="text-grayDark leading-relaxed text-sm sm:text-base">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black opacity-10 rounded-full translate-x-1/3 translate-y-1/3" />
        
        <div className="section-container text-center px-6 md:px-12 lg:px-20 py-16 md:py-24 relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#8c53ff] mb-6 leading-tight">
              Ready to Shape the Future?
            </h2>
            <p className="text-white/90 text-base md:text-lg lg:text-xl mb-10 px-4">
              Whether you're looking to hire top-tier talent or find your next big opportunity, IVP is your definitive partner in growth.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 px-6 sm:px-0">
              <Button
                href="/signUp"
                external
                variant="secondary"
                size="lg"
                className="bg-white text-black border-white px-10 shadow-xl w-full sm:w-auto"
              >
                Get Started Today
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;