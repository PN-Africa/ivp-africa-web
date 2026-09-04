import type { NavLink, SocialLink, Service } from '../types';

// Navigation Links
export const NAV_LINKS: NavLink[] = [
  { name: 'Home', path: '/' },
  { 
    name: 'About', 
    path: '#', 
    subLinks:[
      {name: 'About Us', path: '/about'},
      { name: 'Services', path: '/services' }
    ]
  },
  { 
    name: 'Jobs', 
    path: '#',
    subLinks: [
      { name: 'Search Jobs', path: '/jobs' },
      { name: 'Browse Categories', path: '/categories' },
      { name: 'Saved Jobs', path: '/saved-jobs' }
    ]
  },
  { name: 'Employers', path: '/employers' },
  { 
    name: 'Legal & FAQ', 
    path: '#',
    subLinks: [
      { name: 'FAQ', path: '/faqs' },
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms', path: '/terms' }
    ]
  },
  { name: 'Contact Us', path: '/contact' },
];

// Social Links
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/internshipvaultprogram/',
    icon: 'linkedin',
  },
  {
    name: 'Twitter',
    url: 'https://x.com/',
    icon: 'twitter',
  },
  {
    name: 'Instagram',
    url: 'https://share.google/11bJzc9mRwUxIFVFd',
    icon: 'instagram',
  },
];


// Services Data
export const SERVICES: Service[] = [
  {
    id: 1,
    title: 'Smart job search',
    description: 'Filter by role, location, industry, and experience across the continent.',
    icon: 'search', 
    features: [
      '',
    ],
  },
  {
    id: 2,
    title: 'Application tracking',
    description: 'See where every application stands — applied, reviewed, shortlisted, offered.',
    icon: 'clipboard-list', 
    features: [
      '',
    ],
  },
  {
    id: 3,
    title: 'Job posting suite',
    description: 'Post, edit, and manage roles with applicant workflows and interview scheduling.',
    icon: 'briefcase', 
    features: [
      '',
    ],
  },
  {
    id: 4, 
    title: 'Company profiles',
    description: 'Showcase your brand, team, and mission to attract the right candidates.',
    icon: 'building',
    features: [
      '',
    ],
  },
  {
    id: 5,
    title: 'Verified employers',
    description: 'Every company is vetted before they can post. Fewer scams, more real jobs.',
    icon: 'shield-check', 
    features: [
      '',
    ],
  },
  {
    id: 6,
    title: 'Real-time notifications',
    description: 'Instant updates when things change — no email refresh anxiety.',
    icon: 'bell', 
    features: [
      '',
    ],
  },
];

// Contact Info
export const CONTACT_INFO = {
  email: 'workwithivp@gmail.com',
  phone: '+2348058651819',
  location: 'Nigeria',
  serviceFormUrl: 'https://forms.gle/your-actual-form-link-here',
};
// API Endpoints
export const API_ENDPOINTS = {
  contact: '/api/contact',
  newsletter: '/api/newsletter',
};