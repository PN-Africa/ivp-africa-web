'use client';
import React, { useState } from 'react';
import { 
  HiSearch, 
  HiChevronDown, 
  HiChatAlt2, 
  HiMail,
  HiUser,
  HiBriefcase,
  HiInformationCircle
} from 'react-icons/hi';
import Button from '../components/common/Button';

// --- Types ---
type FaqCategory = 'General' | 'Job Seekers' | 'Account';

interface FAQ {
  id: number;
  category: FaqCategory;
  question: string;
  answer: string;
}

// --- Dummy Data ---
const FAQS: FAQ[] = [
  // General
  {
    id: 1,
    category: 'General',
    question: 'Is the platform completely free to use?',
    answer: 'Yes! Our platform is 100% free for job seekers. You can create a profile, browse jobs, save opportunities, and apply without ever paying a fee. We only charge employers for posting job listings.',
  },
  {
    id: 2,
    category: 'General',
    question: 'How often are new jobs added?',
    answer: 'New jobs are aggregated and posted daily. Our system continuously updates with fresh opportunities from top tech companies, startups, and remote-first organizations across the globe.',
  },
  // Job Seekers
  {
    id: 3,
    category: 'Job Seekers',
    question: 'How do I apply for a job?',
    answer: 'Once you find a job you like, click on it to view the details. You can click the "Apply Now" button, which will either allow you to apply directly through our platform using your saved profile/CV, or redirect you to the company\'s official application portal.',
  },
  {
    id: 4,
    category: 'Job Seekers',
    question: 'How does the "Saved Jobs" feature work?',
    answer: 'You can click the bookmark icon on any job card to save it. This adds the job to your private "Saved Jobs" dashboard, allowing you to review the details and apply later at your convenience.',
  },
  {
    id: 5,
    category: 'Job Seekers',
    question: 'Can I upload multiple CVs?',
    answer: 'Currently, you can upload one primary CV to your profile, but you can always overwrite it with a new version before applying for a specific role. We recommend tailoring your portfolio links (like GitHub or personal websites) in your profile settings.',
  },
  // Account
  {
    id: 6,
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Go to the login page and click on "Forgot Password?". Enter the email address associated with your account, and we will send you a secure link to create a new password.',
  },
  {
    id: 7,
    category: 'Account',
    question: 'Can I delete my account and data?',
    answer: 'Yes. You can permanently delete your account and all associated data by navigating to Settings > Privacy > Delete Account. Please note that this action cannot be undone.',
  },
];

const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('General');
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  // Filter FAQs based on active category and search query
  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    // If searching, ignore category tabs to show all relevant results
    if (searchQuery.trim() !== '') return matchesSearch;
    return matchesCategory;
  });

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 sm:pt-28 sm:pb-20">

      {/* Hero & Search Section */}
      <div className="bg-primary/5 py-12 sm:py-16 border-b border-primary/10">
        <div className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#8c52ff] mb-4 sm:mb-6">
            How can we <span className="text-primary">help?</span>
          </h1>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 flex items-center mb-4 sm:mb-6 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
            <div className="pl-3 sm:pl-4 pr-1 sm:pr-2 text-gray-400">
              <HiSearch className="text-lg sm:text-xl" />
            </div>
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className="w-full bg-transparent border-none focus:ring-0 text-gray-700 py-2 sm:py-3 px-2 outline-none text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenFaq(null); // Close accordions when searching
              }}
            />
            <Button 
              href="#" 
              variant="primary"
              size="sm"
              className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-md transition-all duration-300 hidden md:block"
            >
              Search
            </Button>
          </div>
          <p className="text-sm sm:text-base text-gray-500">
            Browse our most frequently asked questions or search for a specific topic.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 max-w-4xl mx-auto">

        {/* Category Tabs (Hide if searching) */}
        {searchQuery.trim() === '' && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
            {(['General', 'Job Seekers', 'Account'] as FaqCategory[]).map((category) => {
              // Map icons to categories
              let Icon = HiInformationCircle;
              if (category === 'Job Seekers') Icon = HiBriefcase;
              if (category === 'Account') Icon = HiUser;

              return (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setOpenFaq(null); // Reset open FAQ on tab change
                  }}
                  className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${
                    activeCategory === category
                      ? 'bg-[#8c52ff] text-white shadow-md shadow-primary/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  <Icon className="text-base sm:text-lg" />
                  {category}
                </button>
              );
            })}
          </div>
        )}

        {/* Search Results Header */}
        {searchQuery.trim() !== '' && (
          <div className="mb-6 sm:mb-8 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Search results for "{searchQuery}"
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Found {filteredFaqs.length} result(s)</p>
          </div>
        )}

        {/* FAQ Accordions */}
        <div className="space-y-3 sm:space-y-4 min-h-[300px] sm:min-h-[400px]">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
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
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none group"
                >
                  <span className={`font-bold text-base sm:text-lg transition-colors duration-300 pr-4 ${openFaq === faq.id ? 'text-primary' : 'text-gray-900 group-hover:text-primary'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${openFaq === faq.id ? 'bg-primary/10 text-primary rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary'}`}>
                    <HiChevronDown className="text-lg sm:text-xl" />
                  </div>
                </button>

                {/* Accordion Content */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    openFaq === faq.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 pt-0 sm:p-6 sm:pt-0 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-50">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State for Search */
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-100">
              <HiSearch className="text-4xl sm:text-5xl text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">We couldn't find any FAQs matching your search criteria. Please try another keyword.</p>
            </div>
          )}
        </div>
      </div>

      {/* Still Need Help Section */}
      <div className="px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-100 shadow-sm text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Still have questions?</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-xl mx-auto">
            Can't find the answer you're looking for? Please chat to our friendly team or drop us an email, and we'll get back to you shortly.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <a 
              href="mailto:support@yourdomain.com"
              className="flex items-center justify-center gap-2 sm:gap-3 bg-gray-50 hover:bg-primary/5 border border-gray-200 hover:border-primary/30 text-gray-700 hover:text-primary w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 group"
            >
              <HiMail className="text-xl sm:text-2xl text-gray-400 group-hover:text-primary transition-colors" />
              Email Support
            </a>
            <button 
              className="flex items-center justify-center gap-2 sm:gap-3 bg-primary hover:bg-[#8c52ff] text-white w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <HiChatAlt2 className="text-xl sm:text-2xl" />
              Live Chat
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FAQPage;