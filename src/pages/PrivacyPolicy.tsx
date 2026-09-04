'use client';
import React, { useEffect, useState } from 'react';
import { 
  HiShieldCheck, 
  HiDocumentText, 
  HiDatabase, 
  HiShare, 
  HiLockClosed, 
  HiUserCircle,
  HiMail
} from 'react-icons/hi';
import Button from '../components/common/Button';

// --- Dummy Data for Policy Sections ---
const POLICY_SECTIONS = [
  {
    id: 'information-we-collect',
    icon: <HiDatabase className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: '1. Information We Collect',
    content: (
      <>
        <p>We collect information you provide directly to us when you create an account, update your profile, upload a CV, or apply for a job. This includes:</p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
          <li><strong>Personal Details:</strong> Name, email address, phone number, and location.</li>
          <li><strong>Professional Data:</strong> Employment history, education, skills, GitHub/portfolio links, and resume/CV files.</li>
          <li><strong>Account Credentials:</strong> Passwords (securely hashed and encrypted) and security preferences.</li>
        </ul>
        <p className="mt-4">We also automatically collect certain usage data, such as your IP address, browser type, and interactions with our platform (e.g., jobs saved, searches performed) to improve our AI-powered matching systems.</p>
      </>
    )
  },
  {
    id: 'how-we-use',
    icon: <HiDocumentText className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: '2. How We Use Your Information',
    content: (
      <>
        <p>Your data powers the core experience of our platform. We use the information we collect to:</p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
          <li>Facilitate job applications and match your profile with relevant employers using our agentic AI workflows.</li>
          <li>Communicate with you regarding application statuses, interview requests, and platform updates.</li>
          <li>Analyze platform usage to improve our services, search algorithms, and user interface.</li>
          <li>Prevent fraud, maintain system security, and enforce our Terms of Service.</li>
        </ul>
      </>
    )
  },
  {
    id: 'information-sharing',
    icon: <HiShare className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: '3. Information Sharing',
    content: (
      <>
        <p>We do not sell your personal data to third parties. We only share your information in the following circumstances:</p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
          <li><strong>With Employers:</strong> When you apply for a job or toggle your profile to "Visible to Recruiters," relevant employers can view your professional data.</li>
          <li><strong>Service Providers:</strong> We use trusted third-party services for cloud hosting (e.g., AWS, Supabase), email delivery, and analytics. These providers are bound by strict data processing agreements.</li>
          <li><strong>Legal Requirements:</strong> We may disclose information if required by law, subpoena, or other legal processes.</li>
        </ul>
      </>
    )
  },
  {
    id: 'data-security',
    icon: <HiLockClosed className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: '4. Data Security',
    content: (
      <>
        <p>We implement industry-standard technical and organizational measures to secure your personal data against unauthorized access, loss, or alteration. This includes:</p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
          <li>End-to-end encryption for sensitive data transmissions (SSL/TLS).</li>
          <li>Secure database architectures with strict access controls and regular security audits.</li>
          <li>Routine vulnerability scanning and penetration testing.</li>
        </ul>
        <p className="mt-4">While we strive to protect your data, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
      </>
    )
  },
  {
    id: 'your-rights',
    icon: <HiUserCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: '5. Your Rights & Choices',
    content: (
      <>
        <p>You retain full control over your personal data. Depending on your jurisdiction (including GDPR and CCPA compliance), you have the right to:</p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
          <li><strong>Access & Export:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Correction:</strong> Update or correct inaccuracies in your profile at any time.</li>
          <li><strong>Deletion ("Right to be Forgotten"):</strong> Permanently delete your account and associated data via your Account Settings.</li>
          <li><strong>Opt-Out:</strong> Unsubscribe from marketing and job alert emails at any time.</li>
        </ul>
      </>
    )
  }
];

const PrivacyPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(POLICY_SECTIONS[0].id);

  // Simple scroll spy to highlight the active Table of Contents item
  useEffect(() => {
    const handleScroll = () => {
      const sectionOffsets = POLICY_SECTIONS.map(section => {
        const element = document.getElementById(section.id);
        return {
          id: section.id,
          offsetTop: element ? element.offsetTop - 150 : 0
        };
      });

      const scrollPosition = window.scrollY;

      // Find the current active section
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
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-28 pb-12 sm:pb-20">

      {/* Header */}
      <div className="bg-primary/5 py-12 sm:py-16 border-b border-primary/10">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white text-primary rounded-xl sm:rounded-2xl shadow-sm mb-4 sm:mb-6">
            <HiShieldCheck className="text-2xl sm:text-3xl text-[#8c52ff]" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#8c52ff] mb-3 sm:mb-4">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg">
            Last Updated: July 27, 2026
          </p>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-4 sm:mt-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* Sidebar: Table of Contents (Sticky on Desktop, Horizontal Scroll on Mobile) */}
          <aside className="w-full lg:w-1/4 flex-shrink-0 z-10">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-32">
              <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 uppercase text-xs sm:text-sm tracking-wider hidden lg:block">
                Table of Contents
              </h3>
              
              {/* Nav items: Row with horizontal scroll on mobile, Column on desktop */}
              <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-1 pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {POLICY_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => scrollToSection(section.id, e)}
                    className={`block px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-300 flex-shrink-0 lg:flex-shrink ${
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
          <main className="w-full lg:w-3/4 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border border-gray-100">

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
                At our platform, we take your privacy seriously. This policy explains how we collect, use, and protect your personal data when you use our website, apply for jobs, or interact with our employer services. Please read this document carefully to understand our practices regarding your personal data.
              </p>

              <div className="space-y-10 sm:space-y-12">
                {POLICY_SECTIONS.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-32">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-100 shadow-sm text-[#8c52ff] rounded-xl flex items-center justify-center flex-shrink-0">
                        {section.icon}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">
                        {section.title}
                      </h2>
                    </div>
                    <div className="text-gray-600 leading-relaxed text-sm sm:text-[17px]">
                      {section.content}
                    </div>
                    {/* Divider for all but the last section */}
                    {section.id !== POLICY_SECTIONS[POLICY_SECTIONS.length - 1].id && (
                      <hr className="mt-10 sm:mt-12 border-gray-100" />
                    )}
                  </div>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Footer Contact CTA */}
      <div className="px-4 sm:px-6 lg:px-8 mt-10 sm:mt-16 max-w-6xl mx-auto">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white text-primary rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <HiMail className="text-2xl text-[#8c52ff]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Privacy Concerns?</h3>
              <p className="text-sm sm:text-base text-gray-600">Reach out to our Data Protection Officer.</p>
            </div>
          </div>

          <Button 
            href="mailto:privacy@yourdomain.com"
            variant="primary"
            size="md"
            className="w-full md:w-auto bg-primary text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold shadow-md transition-all duration-300 whitespace-nowrap"
          >
            Contact Privacy Team
          </Button>
          
        </div>
      </div>

    </div>
  );
};

export default PrivacyPolicy;