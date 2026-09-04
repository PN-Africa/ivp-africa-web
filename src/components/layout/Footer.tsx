'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Logo from '../common/Logo';
import Button from '../common/Button';
import SocialLinks from '../common/SocialLinks';
import { CONTACT_INFO } from '../../utils/constants';
import { isValidEmail, formatPhoneNumber } from '../../utils/helpers';
import { subscribeNewsletter } from '../../services/api';

// Define your background image path here (update with your actual asset path)
const backgroundImage = '/assets/footer-bg.jpg';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await subscribeNewsletter(email);
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
      console.error('error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer 
      className="bg-black text-white px-4 sm:px-8 lg:px-20 bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay to ensure text remains readable over the image */}
      <div className="absolute inset-0 bg-black/80 md:bg-black/60"></div>

      {/* section-container / max-width wrapper */}
      <div className="max-w-7xl mx-auto py-12 md:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Logo & Get Started */}
          <div className="space-y-4 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <Logo variant="light" size="lg" />
            <p className="text-gray-400 text-sm md:text-base max-w-sm md:max-w-none">
              A trusted talent placement platform connecting qualified candidates 
              with employers across the continent.
            </p>
          </div>

          {/* Support Section */}
          <div className="space-y-4 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">Support</h3>
            <div className="space-y-3 md:space-y-4">
              <div>
                <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Phone</p>
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="text-gray-300 hover:text-[#8c52ff] transition-colors text-sm md:text-base"
                >
                  {formatPhoneNumber(CONTACT_INFO.phone)}
                </a>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Email</p>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-gray-300 hover:text-[#8c52ff] transition-colors break-all text-sm md:text-base"
                >
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>

            {/* Explicit white/brand text color wrapper for social icons */}
            <div className="pt-2 w-full flex justify-center md:justify-start">
              <SocialLinks className="text-gray-400 hover:text-white" size="sm" />
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left mt-6 md:mt-0">
            <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">Subscribe to Newsletter</h3>
            <p className="text-gray-400 text-sm md:text-base max-w-md md:max-w-none">
              Be updated with all the latest trends, products, and insights
              in AI, web development, and design.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md md:max-w-none">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:flex-1 px-4 py-3 sm:py-4 rounded-lg bg-white/5 border border-white/10 text-white 
                           placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-[#8c52ff] focus:border-transparent transition-all"
                required
              />
              <Button
                type="submit"
                variant="secondary"
                loading={isLoading}
                className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-white text-black hover:bg-[#8c52ff] hover:text-white hover:border-[#8c52ff] transition-colors whitespace-nowrap"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Copyright & Legal */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-500 text-xs md:text-sm">
            © {new Date().getFullYear()} IVP Africa. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs md:text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;