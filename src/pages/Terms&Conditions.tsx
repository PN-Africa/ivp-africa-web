'use client';
import React, { useEffect, useState } from 'react';
import { 
  HiScale, 
  HiCheckCircle, 
  HiUserGroup, 
  HiBriefcase, 
  HiXCircle, 
  HiExclamationCircle,
  HiMail
} from 'react-icons/hi';
import Button from '../components/common/Button';

// --- Dummy Data for Terms Sections ---
const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    icon: <HiCheckCircle className="w-5 h-5 md:w-6 md:h-6" />,
    title: '1. Acceptance of Terms',
    content: (
      <>
        <p>By accessing and using this platform, you accept and agree to be bound by the terms and provisions of this agreement. In addition, when using our services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
        <p className="mt-4">If you do not agree to abide by these Terms and Conditions, you are not authorized to use or access the platform.</p>
      </>
    )
  },
  {
    id: 'user-accounts',
    icon: <HiUserGroup className="w-5 h-5 md:w-6 md:h-6" />,
    title: '2. User Accounts & Responsibilities',
    content: (
      <>
        <p>To access certain features of the platform (such as saving jobs or applying), you must register for an account. You agree to:</p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
          <li>Provide accurate, current, and complete information during the registration process.</li>
          <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
          <li>Promptly notify us if you discover or suspect any security breaches related to your account.</li>
        </ul>
        <p className="mt-4">You are responsible for all activities that occur under your account, whether acting as a Job Seeker or an Employer.</p>
      </>
    )
  },
  {
    id: 'employer-guidelines',
    icon: <HiBriefcase className="w-5 h-5 md:w-6 md:h-6" />,
    title: '3. Employer & Job Posting Rules',
    content: (
      <>
        <p>Employers using our platform to post job opportunities must adhere to the following strict guidelines:</p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
          <li><strong>Accuracy:</strong> All job postings must represent genuine, active employment opportunities.</li>
          <li><strong>Non-Discrimination:</strong> Job postings must comply with all applicable local and international labor laws and must not discriminate based on race, gender, religion, age, or disability.</li>
          <li><strong>Prohibited Content:</strong> You may not post multi-level marketing (MLM) schemes, unpaid internships disguised as full-time roles, or positions requiring candidates to pay a fee to apply.</li>
        </ul>
        <p className="mt-4">We reserve the right to remove any job posting at our sole discretion without issuing a refund if it violates these terms.</p>
      </>
    )
  },
  {
    id: 'intellectual-property',
    icon: <HiScale className="w-5 h-5 md:w-6 md:h-6" />,
    title: '4. Intellectual Property',
    content: (
      <>
        <p>The platform and its original content (excluding user-provided CVs, portfolio links, and company logos), features, and functionality, including our proprietary AI matching algorithms, are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
        <p className="mt-4">You grant us a non-exclusive, worldwide, royalty-free license to use, copy, reproduce, and display the content you upload (such as your profile information or job descriptions) solely for the purpose of operating and providing our services.</p>
      </>
    )
  },
  {
    id: 'termination',
    icon: <HiXCircle className="w-5 h-5 md:w-6 md:h-6" />,
    title: '5. Account Termination',
    content: (
      <>
        <p>We may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.</p>
        <p className="mt-4">If you wish to terminate your account, you may simply discontinue using the platform or delete your account from the settings dashboard. All provisions of the Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.</p>
      </>
    )
  },
  {
    id: 'liability',
    icon: <HiExclamationCircle className="w-5 h-5 md:w-6 md:h-6" />,
    title: '6. Limitation of Liability',
    content: (
      <>
        <p>In no event shall the platform, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:</p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
          <li>Loss of profits, data, use, goodwill, or other intangible losses.</li>
          <li>Your inability to access or use the platform.</li>
          <li>Any conduct or content of any third party on the platform (e.g., a dispute between an Employer and a Job Seeker).</li>
        </ul>
        <p className="mt-4">The platform is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee employment, nor do we guarantee the quality of candidates.</p>
      </>
    )
  }
];

const TermsAndConditions: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(TERMS_SECTIONS[0].id);

  // Scroll spy to highlight the active Table of Contents item
  useEffect(() => {
    const handleScroll = () => {
      const sectionOffsets = TERMS_SECTIONS.map(section => {
        const element = document.getElementById(section.id);
        return {
          id: section.id,
          offsetTop: element ? element.offsetTop - 150 : 0
        };
      });

      const scrollPosition = window.scrollY;
      
      for (let i = sectionOffsets.length - 1; i >= 0; i--) {
        if (scrollPosition >= sectionOffsets[i].offsetTop) {
          setActiveSection(sectionOffsets[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100, // Offset for fixed headers
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-12 md:pb-20">
      
      {/* Header */}
      <div className="bg-primary/5 py-10 md:py-16 border-b border-primary/10">
        <div className="section-container px-4 sm:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white text-primary rounded-xl md:rounded-2xl shadow-sm mb-4 md:mb-6">
            <HiScale className="text-2xl md:text-3xl text-[#8c52ff]" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#8c52ff] mb-3 md:mb-4">
            Terms & <span className="text-primary">Conditions</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Last Updated: July 27, 2026
          </p>
        </div>
      </div>

      <div className="section-container px-4 sm:px-8 lg:px-12 py-10 lg:py-20 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* Sidebar: Table of Contents (Sticky on Desktop) */}
          <aside className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
            <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-32">
              <h3 className="font-bold text-gray-900 mb-3 md:mb-4 uppercase text-xs md:text-sm tracking-wider">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {TERMS_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => scrollToSection(section.id, e)}
                    className={`block px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="w-full lg:w-2/3 xl:w-3/4 bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border border-gray-100">
            
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 md:mb-10">
                Welcome to our platform. These terms and conditions outline the rules and regulations for the use of our website and services. By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use the platform if you do not accept all of the terms and conditions stated on this page.
              </p>

              <div className="space-y-10 md:space-y-12">
                {TERMS_SECTIONS.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-32">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-[#8c52ff] rounded-xl flex items-center justify-center flex-shrink-0">
                        {section.icon}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 m-0">
                        {section.title}
                      </h2>
                    </div>
                    <div className="text-gray-600 leading-relaxed text-sm md:text-[17px]">
                      {section.content}
                    </div>
                    {/* Divider for all but the last section */}
                    {section.id !== TERMS_SECTIONS[TERMS_SECTIONS.length - 1].id && (
                      <hr className="mt-8 md:mt-12 border-gray-100" />
                    )}
                  </div>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Footer Contact CTA */}
      <div className="section-container px-4 sm:px-8 lg:px-12 mt-4 md:mt-8 max-w-7xl mx-auto">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white text-primary rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <HiMail className="text-xl md:text-2xl text-[#8c52ff]" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Questions about our Terms?</h3>
              <p className="text-sm md:text-base text-gray-600">Contact our legal team for clarification.</p>
            </div>
          </div>
          <Button 
            href="mailto:legal@yourdomain.com"
            variant="primary"
            size="md"
            className="bg-primary text-white px-8 py-3.5 rounded-full font-bold shadow-md transition-all duration-300 w-full md:w-auto whitespace-nowrap text-center flex justify-center"
          >
            Contact Legal
          </Button>
        </div>
      </div>

    </div>
  );
};

export default TermsAndConditions;