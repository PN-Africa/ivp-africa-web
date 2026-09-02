'use client';
import React, { useState } from 'react';
import { 
  HiSearch, 
  HiLocationMarker, 
  HiBriefcase, 
  HiOutlineBookmark, 
  HiBookmark,
  HiFilter,
  HiClock
} from 'react-icons/hi';
import Button from '../components/common/Button';

// --- Types ---
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedAt: string;
  isSaved?: boolean;
  tags: string[];
}

// --- Dummy Data ---
const DUMMY_JOBS: Job[] = [
  {
    id: '1',
    title: 'Full Stack Web Developer',
    company: 'Jantra Soft',
    location: 'Remote',
    type: 'Full-time',
    salary: '$80k - $120k',
    postedAt: '2 hours ago',
    isSaved: false,
    tags: ['React', 'Node.js', 'TypeScript', 'Tailwind'],
  },
  {
    id: '2',
    title: 'AI Engineer',
    company: 'TechStart Inc.',
    location: 'Lagos, Nigeria',
    type: 'Contract',
    salary: '$90k - $140k',
    postedAt: '5 hours ago',
    isSaved: true,
    tags: ['Python', 'LLMs', 'LangChain', 'VoltAgent'],
  },
  {
    id: '3',
    title: 'Backend Developer',
    company: 'Nile Africa Technologies',
    location: 'Hybrid',
    type: 'Full-time',
    salary: 'Competitive',
    postedAt: '1 day ago',
    isSaved: false,
    tags: ['NestJS', 'PostgreSQL', 'Supabase', 'Prisma'],
  },
  {
    id: '4',
    title: 'Frontend React Engineer',
    company: 'TravelPal',
    location: 'Remote',
    type: 'Full-time',
    salary: '$70k - $100k',
    postedAt: '2 days ago',
    isSaved: false,
    tags: ['React', 'Next.js', 'Framer Motion'],
  }
];

const SearchJobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>(DUMMY_JOBS);

  const toggleSaveJob = (id: string) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, isSaved: !job.isSaved } : job
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-12 md:pb-20">
      
      {/* Search Hero Section */}
      <div className="bg-primary/5 py-10 md:py-12 border-b border-primary/10">
        <div className="section-container px-4 sm:px-8 lg:px-20">
          <div className="max-w-4xl mx-auto text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#8c52ff] mb-3 md:mb-4">
              Find Your Dream <span className="text-primary">Role</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 px-2">
              Search thousands of tech jobs, freelance opportunities, and AI roles across the continent.
            </p>
          </div>

          {/* Search Bar Container */}
          <div className="max-w-4xl mx-auto bg-white p-3 md:p-2 rounded-2xl md:rounded-full shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center bg-gray-50 rounded-xl md:rounded-full px-4 py-3 md:py-2.5 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
              <HiSearch className="text-gray-400 text-xl min-w-[24px]" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or company" 
                className="w-full bg-transparent border-none focus:ring-0 text-gray-700 px-3 outline-none text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 flex items-center bg-gray-50 rounded-xl md:rounded-full px-4 py-3 md:py-2.5 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
              <HiLocationMarker className="text-gray-400 text-xl min-w-[24px]" />
              <input 
                type="text" 
                placeholder="City, state, or Remote" 
                className="w-full bg-transparent border-none focus:ring-0 text-gray-700 px-3 outline-none text-sm md:text-base"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>

            <Button 
              href="#"
              variant="primary"
              size="md"
              className="bg-primary text-white md:w-auto w-full px-8 py-3.5 md:py-3 rounded-xl md:rounded-full font-semibold shadow-md transition-all duration-300 text-center flex justify-center"
            >
              Search Jobs
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="section-container mt-8 md:mt-12 px-4 sm:px-8 lg:px-20 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <HiFilter className="text-gray-400" />
            </div>

            {/* Job Type Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm md:text-base">Job Type</h4>
              <div className="space-y-2.5">
                {['Full-time', 'Part-time', 'Contract', 'Freelance'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 text-primary focus:ring-primary/30 transition-colors" />
                    <span className="text-gray-600 text-sm md:text-base group-hover:text-primary transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-100 my-5 md:my-6" />

            {/* Experience Level Filter */}
            <div className="mb-2">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm md:text-base">Experience Level</h4>
              <div className="space-y-2.5">
                {['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Manager'].map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 text-primary focus:ring-primary/30 transition-colors" />
                    <span className="text-gray-600 text-sm md:text-base group-hover:text-primary transition-colors">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Recommended for you</h2>
            <span className="text-xs md:text-sm text-gray-500 font-medium">Showing {jobs.length} results</span>
          </div>

          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group relative"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                
                {/* Job Info */}
                <div className="flex gap-3 md:gap-4 flex-1">
                  {/* Placeholder Logo */}
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#8c52ff] font-bold text-lg md:text-xl">
                    {job.company.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 sm:line-clamp-1">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-gray-600 font-medium text-xs md:text-sm">
                      <span className="text-gray-900">{job.company}</span>
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-gray-300 hidden sm:block"></span>
                      <span className="flex items-center gap-1">
                        <HiLocationMarker className="text-gray-400 shrink-0" />
                        {job.location}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[11px] md:text-sm font-medium rounded-lg flex items-center gap-1">
                        <HiBriefcase className="w-3 h-3 md:w-4 md:h-4" />
                        {job.type}
                      </span>
                      {job.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[11px] md:text-sm font-medium rounded-lg border border-gray-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side Actions - Hidden on mobile, shown on tablet/desktop */}
                <div className="hidden sm:flex sm:flex-col items-end justify-between shrink-0">
                  <button 
                    onClick={() => toggleSaveJob(job.id)}
                    className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                    title={job.isSaved ? "Unsave Job" : "Save Job"}
                  >
                    {job.isSaved ? (
                      <HiBookmark className="text-primary text-xl md:text-2xl" />
                    ) : (
                      <HiOutlineBookmark className="text-gray-400 hover:text-primary text-xl md:text-2xl transition-colors" />
                    )}
                  </button>

                  <div className="text-right mt-2 md:mt-0">
                    <p className="font-bold text-gray-900 mb-1 md:mb-2">{job.salary}</p>
                    <p className="text-[11px] md:text-sm text-gray-400 flex items-center justify-end gap-1">
                      <HiClock /> {job.postedAt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Salary & Actions Row - Hidden on tablet/desktop */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex sm:hidden items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{job.salary}</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <HiClock /> {job.postedAt}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => toggleSaveJob(job.id)}
                    className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {job.isSaved ? (
                      <HiBookmark className="text-primary text-lg" />
                    ) : (
                      <HiOutlineBookmark className="text-gray-400 text-lg" />
                    )}
                  </button>
                  <Button 
                    href={`/jobs/${job.id}`}
                    variant="primary"
                    size="sm"
                    className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-primary hover:text-white duration-300"
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
              
              {/* Desktop Apply Button Row (Only visible on sm screens and up, injected at bottom of card) */}
              <div className="hidden sm:flex mt-4 pt-4 border-t border-gray-100 justify-end">
                  <Button 
                    href={`/jobs/${job.id}`}
                    variant="primary"
                    size="sm"
                    className="bg-primary/10 text-primary px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-primary hover:text-white"
                  >
                    Apply Now
                  </Button>
              </div>
            </div>
          ))}

          {/* Pagination Placeholder */}
          <div className="flex justify-center mt-8 md:mt-10">
            <Button 
              href="#"
              variant="outline"
              size="md"
              className="border-2 border-gray-200 text-gray-600 hover:text-white px-6 md:px-8 py-2 md:py-2.5 rounded-full text-sm md:text-base font-semibold transition-all duration-300 w-full sm:w-auto text-center"
            >
              Load More Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchJobs;