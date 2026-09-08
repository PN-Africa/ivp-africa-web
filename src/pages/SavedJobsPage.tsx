'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HiLocationMarker, 
  HiBriefcase, 
  HiBookmark,
  HiOutlineTrash,
  HiSearch,
  HiClock
} from 'react-icons/hi';
import Button from '../components/common/Button'; 

// --- Types ---
interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  savedAt: string;
  tags: string[];
}

// --- Dummy Data ---
const INITIAL_SAVED_JOBS: SavedJob[] = [
  {
    id: '1',
    title: 'Senior AI Engineer',
    company: 'VoltAgent Technologies',
    location: 'Lagos, Nigeria (Hybrid)',
    type: 'Full-time',
    salary: '₦1.5M - ₦2.5M / month',
    savedAt: '2 days ago',
    tags: ['Python', 'LLMs', 'LangChain', 'Agentic UI'],
  },
  {
    id: '2',
    title: 'Full Stack Developer (Next.js & NestJS)',
    company: 'TravelPal Sync',
    location: 'Remote',
    type: 'Contract',
    salary: '$4,000 - $6,000 / month',
    savedAt: '5 days ago',
    tags: ['TypeScript', 'NestJS', 'PostgreSQL', 'React'],
  },
  {
    id: '3',
    title: 'Backend Infrastructure Lead',
    company: 'PN Africa',
    location: 'Remote',
    type: 'Full-time',
    salary: 'Competitive',
    savedAt: '1 week ago',
    tags: ['Supabase', 'Prisma', 'System Architecture'],
  }
];

const SavedJobs: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(INITIAL_SAVED_JOBS);

  const removeJob = (id: string) => {
    // In a real app, this would hit your backend API
    setSavedJobs(savedJobs.filter(job => job.id !== id));
  };

  const clearAll = () => {
    setSavedJobs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-12 md:pb-20">
      
      {/* Header Section */}
      <div className="section-container px-4 sm:px-8 lg:px-20 py-10 md:py-16 lg:py-20 mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#8c52ff]">
              Saved <span className="text-primary">Jobs</span>
            </h1>
            <p className="text-gray-500 mt-2 text-base md:text-lg max-w-2xl">
              Keep track of the opportunities you're interested in applying for.
            </p>
          </div>
          
          {savedJobs.length > 0 && (
            <button 
              onClick={clearAll}
              className="text-gray-400 w-full sm:w-auto justify-center hover:text-red-500 font-medium text-sm flex items-center gap-1.5 transition-colors duration-300 bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm hover:border-red-100 hover:bg-red-50"
            >
              <HiOutlineTrash className="text-lg" />
              Clear all saved
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="section-container px-4 sm:px-8 lg:px-20">
        
        {savedJobs.length === 0 ? (
          
          /* --- EMPTY STATE --- */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 relative">
              <HiBookmark className="text-4xl md:text-5xl text-[#8c52ff]" />
              <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center border border-gray-50 shadow-sm">
                <HiSearch className="text-[#8c52ff] text-xs md:text-sm" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No saved jobs yet</h2>
            <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-8">
              When you see a job you like, click the bookmark icon to save it here so you can easily review and apply later.
            </p>
            <Button 
              href="/jobs"
              variant="primary"
              size="md"
              className="bg-primary text-black px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold shadow-md transition-all duration-300 w-full sm:w-auto"
            >
              Browse Available Jobs
            </Button>
          </div>

        ) : (

          /* --- POPULATED STATE --- */
          <div className="space-y-4 max-w-5xl mx-auto xl:mx-0">
            {savedJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-5 lg:gap-6">
                  
                  {/* Left Side: Job Info */}
                  <div className="flex gap-4 md:gap-5 lg:gap-6 flex-1">
                    {/* Placeholder Logo */}
                    <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#8c52ff] font-bold text-lg md:text-xl lg:text-2xl border border-primary/10">
                      {job.company.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <Link href={`/jobs/${job.id}`}>
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-2 md:line-clamp-1">
                          {job.title}
                        </h3>
                      </Link>
                      
                      <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-1 md:gap-y-2 mt-1.5 md:mt-2 text-gray-600 font-medium text-xs md:text-sm">
                        <span className="text-gray-900 font-semibold">{job.company}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></span>
                        <span className="flex items-center gap-1">
                          <HiLocationMarker className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[150px] sm:max-w-none">{job.location}</span>
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></span>
                        <span className="flex items-center gap-1">
                          <HiBriefcase className="text-gray-400 shrink-0" />
                          {job.type}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
                        {job.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[11px] md:text-xs font-medium rounded-lg border border-gray-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Salary & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 lg:gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 mt-2 lg:mt-0 lg:pt-0 lg:pl-6 w-full lg:w-auto shrink-0">
                    
                    <div className="text-left sm:text-right lg:text-right w-full sm:w-auto">
                      <p className="font-bold text-gray-900 text-base md:text-lg">{job.salary}</p>
                      <p className="text-xs text-gray-400 flex items-center sm:justify-end gap-1 mt-1">
                        <HiClock /> Saved {job.savedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => removeJob(job.id)}
                        className="p-2.5 md:p-3 text-gray-400 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors duration-300 shrink-0"
                        title="Remove from saved"
                      >
                        <HiBookmark className="text-lg md:text-xl" />
                      </button>

                      <Button 
                        href={`/jobs/${job.id}/apply`}
                        variant="primary"
                        size="sm"
                        className="bg-primary text-white w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-300 text-center justify-center"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;