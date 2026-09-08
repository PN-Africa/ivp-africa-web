'use client';
import React from 'react';
import Link from 'next/link';
import { 
  HiCode, 
  HiChip, 
  HiColorSwatch, 
  HiDatabase, 
  HiDeviceMobile, 
  HiChartBar, 
  HiShieldCheck, 
  HiCloud,
  HiArrowRight
} from 'react-icons/hi';
import Button from '../components/common/Button';

// --- Types ---
interface Category {
  id: string;
  name: string;
  description: string;
  jobCount: number;
  icon: React.ReactNode;
  popularRoles: string[];
}

// --- Dummy Data ---
const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Web Development',
    description: 'Build the future of the web with frontend, backend, and full-stack roles.',
    jobCount: 1245,
    icon: <HiCode className="w-8 h-8" />,
    popularRoles: ['React Developer', 'Node.js Engineer', 'Full Stack'],
  },
  {
    id: '2',
    name: 'AI & Machine Learning',
    description: 'Train models, build agentic workflows, and shape AI solutions.',
    jobCount: 832,
    icon: <HiChip className="w-8 h-8" />,
    popularRoles: ['AI Engineer', 'Prompt Engineer', 'Data Scientist'],
  },
  {
    id: '3',
    name: 'Design & UI/UX',
    description: 'Create stunning user experiences and visual identities.',
    jobCount: 654,
    icon: <HiColorSwatch className="w-8 h-8" />,
    popularRoles: ['Product Designer', 'UI Developer', 'Illustrator'],
  },
  {
    id: '4',
    name: 'Database & Architecture',
    description: 'Design robust systems, manage data pipelines, and cloud architecture.',
    jobCount: 421,
    icon: <HiDatabase className="w-8 h-8" />,
    popularRoles: ['Database Admin', 'Solutions Architect', 'Data Engineer'],
  },
  {
    id: '5',
    name: 'Mobile Development',
    description: 'Develop native and cross-platform applications for iOS and Android.',
    jobCount: 593,
    icon: <HiDeviceMobile className="w-8 h-8" />,
    popularRoles: ['Flutter Developer', 'iOS Engineer', 'React Native'],
  },
  {
    id: '6',
    name: 'Data & Analytics',
    description: 'Turn data into actionable insights for business growth.',
    jobCount: 387,
    icon: <HiChartBar className="w-8 h-8" />,
    popularRoles: ['Data Analyst', 'Business Intelligence', 'Growth Hacker'],
  },
  {
    id: '7',
    name: 'Cybersecurity',
    description: 'Protect systems, networks, and data from digital attacks.',
    jobCount: 219,
    icon: <HiShieldCheck className="w-8 h-8" />,
    popularRoles: ['Security Analyst', 'Penetration Tester', 'DevSecOps'],
  },
  {
    id: '8',
    name: 'Cloud & DevOps',
    description: 'Automate deployments, scale infrastructure, and manage cloud servers.',
    jobCount: 476,
    icon: <HiCloud className="w-8 h-8" />,
    popularRoles: ['DevOps Engineer', 'AWS Specialist', 'SRE'],
  },
];

const BrowseCategories: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-12 md:pb-20 overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="bg-primary/5 py-12 md:py-16 border-b border-primary/10 px-4 sm:px-6">
        <div className="section-container text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#8c52ff] mb-4">
            Explore <span className="text-primary">Categories</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-4 sm:mb-8 max-w-2xl mx-auto">
            Discover thousands of job opportunities tailored to your expertise. Whether you're a creative, an engineer, or a strategist, your next role is here.
          </p>
        </div>
      </div>

      {/* Main Categories Grid */}
      <div className="section-container px-4 sm:px-6 md:px-12 lg:px-20 py-8 md:py-16 mt-4 md:mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Popular Categories</h2>
            <p className="text-sm text-gray-500 mt-1">Select a category to view available roles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((category) => (
            <Link 
              key={category.id} 
              href={`/jobs?category=${category.name.toLowerCase().replace(/ & | /g, '-')}`}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 group block relative overflow-hidden"
            >
              {/* Decorative Background Blob on Hover */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-500"></div>

              {/* Icon & Job Count */}
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-[#8c52ff] group-hover:text-white transition-colors duration-300">
                  {category.icon}
                </div>
                <span className="bg-gray-50 text-gray-600 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full border border-gray-100">
                  {category.jobCount} Jobs
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 line-clamp-2">
                {category.description}
              </p>

              {/* Popular Roles Tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
                {category.popularRoles.map((role, idx) => (
                  <span key={idx} className="text-[10px] sm:text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 sm:px-2.5 py-1 rounded-md border border-gray-100">
                    {role}
                  </span>
                ))}
              </div>

              {/* Action Link */}
              <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                Explore Roles <HiArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="section-container px-4 sm:px-6 md:px-12 lg:px-20 mt-12 md:mt-16">
        <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative overflow-hidden shadow-2xl">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Didn't find your specific niche?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg">
              We have hundreds of new jobs posted every day across all tech sectors. Search all open positions to find exactly what you're looking for.
            </p>
          </div>

          <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
            <Button 
              href="/jobs"
              variant="primary"
              size="md"
              className="bg-primary text-white w-full md:w-auto px-8 py-3.5 sm:py-4 rounded-xl md:rounded-full font-bold shadow-lg transition-all duration-300 text-center flex justify-center"
            >
              Search All Jobs
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BrowseCategories;