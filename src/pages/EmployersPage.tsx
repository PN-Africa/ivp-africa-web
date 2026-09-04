'use client';
import React, { useState } from 'react';
import { 
  HiSparkles, 
  HiUserGroup, 
  HiLightningBolt, 
  HiChevronDown, 
  HiBriefcase,
  HiGlobe
} from 'react-icons/hi';
import Button from '../components/common/Button';

// --- Dummy Data ---
const FEATURES = [
  {
    icon: <HiUserGroup className="w-6 h-6 sm:w-7 sm:h-7" />,
    title: 'Access Top Talent',
    description: 'Reach thousands of vetted tech professionals, from full-stack developers to specialized AI engineers.',
  },
  {
    icon: <HiSparkles className="w-6 h-6 sm:w-7 sm:h-7" />,
    title: 'AI-Powered Matching',
    description: 'Our smart algorithms instantly match your job requirements with the most qualified candidates in our database.',
  },
  {
    icon: <HiLightningBolt className="w-6 h-6 sm:w-7 sm:h-7" />,
    title: 'Fast Hiring Process',
    description: 'Reduce your time-to-hire by 50%. Review curated portfolios, GitHub repos, and CVs all in one place.',
  },
];

const FAQS = [
  {
    id: 1,
    question: 'How much does it cost to post a job?',
    answer: 'We offer flexible pricing starting at $49 for a standard 30-day listing. We also have premium tiers that boost your listing to the top of search results and include social media promotion across our networks.',
  },
  {
    id: 2,
    question: 'How does the AI matching system work?',
    answer: 'Our proprietary agentic workflow analyzes the skills, experience, and tech stack requirements in your job description. It then cross-references this with candidate profiles, highlighting those with the highest match percentage directly in your dashboard.',
  },
  {
    id: 3,
    question: 'Can I post remote, hybrid, and on-site roles?',
    answer: 'Absolutely. You can specify the exact working model. Whether you are hiring locally in Lagos or looking for remote talent globally, our filters ensure the right candidates see your listing.',
  },
  {
    id: 4,
    question: 'How long will my job posting remain active?',
    answer: 'Standard job postings remain active for 30 days. You will receive a notification 3 days before expiration, giving you the option to easily renew the listing if you are still interviewing.',
  },
  {
    id: 5,
    question: 'Do you vet the candidates?',
    answer: 'While anyone can create a profile, candidates earn "Verified" badges by passing technical assessments, providing verified GitHub links, and completing portfolio reviews.',
  },
];

const Employers: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(1); // Default first FAQ open

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 sm:pb-16 md:pb-20 overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#8c52ff]/20 via-purple-50/50 to-gray-50 px-4 sm:px-6 md:px-12 lg:px-20 pt-20 sm:pt-28 md:pt-36 pb-16 sm:pb-20 md:pb-28 border-b border-primary/10 relative overflow-hidden">
        {/* Decorative Blurs */}
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="section-container relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm mb-4 sm:mb-6">
            <HiBriefcase className="text-base sm:text-lg" />
            For Employers
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
            Hire the Best <span className="text-[#8c52ff]">Tech Talent</span> <br className="hidden sm:block" />
            in Record Time.
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of innovative companies building their engineering, design, and AI teams through our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs sm:max-w-none mx-auto">
            <Button 
              href="/login"
              variant="primary"
              size="md"
              className="bg-[#8c52ff] hover:bg-[#7b3fe4] text-white w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-bold shadow-lg transition-all duration-300 text-center flex justify-center"
            >
              Post a Job Now
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="section-container px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16 md:py-20 mt-4 sm:mt-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Why Hire With Us?</h2>
          <p className="text-sm sm:text-base text-gray-500">
            We take the friction out of technical recruiting so you can focus on building great products.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 text-[#8c52ff] rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-[#8c52ff] group-hover:text-white transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="section-container max-w-4xl px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16 md:py-20 mt-4 sm:mt-8 mx-auto" id="faq">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Frequently Asked Questions</h2>
          <p className="text-sm sm:text-base text-gray-500">Everything you need to know about posting jobs and finding candidates.</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {FAQS.map((faq) => (
            <div 
              key={faq.id} 
              className={`bg-white rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden ${
                openFaq === faq.id 
                  ? 'border-primary/40 shadow-md shadow-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none gap-4"
              >
                <span className={`font-bold text-base sm:text-lg transition-colors duration-300 ${openFaq === faq.id ? 'text-[#8c52ff]' : 'text-gray-900'}`}>
                  {faq.question}
                </span>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${openFaq === faq.id ? 'bg-primary/10 text-[#8c52ff] rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                  <HiChevronDown className="text-lg sm:text-xl" />
                </div>
              </button>
              
              {/* Accordion Content Area with transition */}
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  openFaq === faq.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-4 sm:p-6 pt-0 text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed border-t border-gray-50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Stats Section */}
      <div className="section-container px-4 sm:px-6 md:px-12 lg:px-20 py-8 sm:py-12 md:py-16 mt-4 sm:mt-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-around gap-6 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex-1 w-full py-3 md:py-0">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">50k+</h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">Active Candidates</p>
          </div>
          <div className="flex-1 w-full pt-6 md:pt-0 py-3 md:py-0">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">2,500+</h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">Successful Hires</p>
          </div>
          <div className="flex-1 w-full pt-6 md:pt-0 py-3 md:py-0">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">120+</h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">Countries Reached</p>
          </div>
        </div>
      </div>

      {/* CTA Footer Banner */}
      <div className="section-container px-4 sm:px-6 md:px-12 lg:px-20 py-8 sm:py-12 md:py-16 mt-4 sm:mt-8">
        <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8c52ff]/20 via-transparent to-transparent opacity-60"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <HiGlobe className="text-4xl sm:text-5xl text-[#8c52ff] mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to build your dream team?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-8 sm:mb-10">
              Create your employer account today and post your first job in less than 5 minutes.
            </p>
            <Button 
              href="/signUp"
              variant="primary"
              size="md"
              className="bg-[#8c52ff] hover:bg-[#7b3fe4] text-white w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold shadow-lg transition-all duration-300 inline-flex justify-center text-center"
            >
              Create Employer Account
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Employers;