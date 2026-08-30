'use client';
import React, { useState } from 'react';
import { 
//  HiCheckCircle, 
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
    icon: <HiUserGroup className="w-7 h-7" />,
    title: 'Access Top Talent',
    description: 'Reach thousands of vetted tech professionals, from full-stack developers to specialized AI engineers.',
  },
  {
    icon: <HiSparkles className="w-7 h-7" />,
    title: 'AI-Powered Matching',
    description: 'Our smart algorithms instantly match your job requirements with the most qualified candidates in our database.',
  },
  {
    icon: <HiLightningBolt className="w-7 h-7" />,
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
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#8c52ff] to-white px-20 py-30 border-b border-primary/10 relative overflow-hidden">
        {/* Decorative Blurs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="section-container relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-none text-primary font-bold text-sm mb-6 ">
            <HiBriefcase className="text-lg" />
            For Employers
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Hire the Best <span className="text-primary">Tech Talent</span> <br className="hidden md:block" />
            in Record Time.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join hundreds of innovative companies building their engineering, design, and AI teams through our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              href="/login"
              variant="primary"
              size="md"
              className="bg-primary text-black w-full sm:w-auto px-8 py-4 rounded-full font-bold shadow-lg transition-all duration-300"
            >
              Post a Job Now
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="section-container px-20 py-20 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Hire With Us?</h2>
          <p className="text-gray-500">We take the friction out of technical recruiting so you can focus on building great products.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#8c52ff] group-hover:text-white transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="section-container mt-24 max-w-4xl px-20 py-20 mx-auto" id="faq">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500">Everything you need to know about posting jobs and finding candidates.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div 
              key={faq.id} 
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                openFaq === faq.id 
                  ? 'border-primary/40 shadow-md shadow-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className={`font-bold text-lg transition-colors duration-300 ${openFaq === faq.id ? 'text-primary' : 'text-gray-900'}`}>
                  {faq.question}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${openFaq === faq.id ? 'bg-primary/10 text-primary rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                  <HiChevronDown className="text-xl" />
                </div>
              </button>
              
              {/* Accordion Content Area with transition */}
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  openFaq === faq.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Stats Section */}
      <div className="section-container px-20 py-20 mt-24">
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-around gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex-1 py-4">
            <h4 className="text-4xl font-bold text-gray-900 mb-2">50k+</h4>
            <p className="text-gray-500 font-medium">Active Candidates</p>
          </div>
          <div className="flex-1 py-4">
            <h4 className="text-4xl font-bold text-gray-900 mb-2">2,500+</h4>
            <p className="text-gray-500 font-medium">Successful Hires</p>
          </div>
          <div className="flex-1 py-4">
            <h4 className="text-4xl font-bold text-gray-900 mb-2">120+</h4>
            <p className="text-gray-500 font-medium">Countries Reached</p>
          </div>
        </div>
      </div>

      {/* CTA Footer Banner */}
      <div className="section-container px-20 py-20 mt-24">
        <div className="bg-gray-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <HiGlobe className="text-5xl text-[#8c52ff] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to build your dream team?
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Create your employer account today and post your first job in less than 5 minutes.
            </p>
            <Button 
              href="/signUp"
              variant="primary"
              size="md"
              className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-lg transition-all duration-300 inline-flex"
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
