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
const backgroundImage = '/assets/';

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
      className="bg-black text-outline px-20 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay to ensure text remains readable over the image */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="section-container py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Get Started */}
          <div className="space-y-6">
            <Logo variant="light" size="lg" />
            <p className="text-grayMedium">
              A trusted talent placement platform connecting qualified candidates 
              with employers across the continent.
            </p>
          </div>

          {/* Support Section */}
<div className="space-y-6">
  <h3 className="text-xl font-bold text-white">Support</h3>
  <div className="space-y-4">
    <div>
      <p className="text-gray-400 text-sm mb-1">Phone</p>
      <a
        href={`tel:${CONTACT_INFO.phone}`}
        className="text-gray-300 hover:text-[#8c52ff] transition-colors"
      >
        {formatPhoneNumber(CONTACT_INFO.phone)}
      </a>
    </div>
    <div>
      <p className="text-gray-400 text-sm mb-1">Email</p>
      <a
        href={`mailto:${CONTACT_INFO.email}`}
        className="text-gray-300 hover:text-[#8c52ff] transition-colors break-all"
      >
        {CONTACT_INFO.email}
      </a>
    </div>
  </div>

  {/* Explicit white/brand text color wrapper for social icons */}
  <div className="pt-2">
    <SocialLinks className="text-gray-400 hover:text-white" size="sm" />
  </div>
</div>

          {/* Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold">Subscribe to Newsletter</h3>
            <p className="text-grayMedium">
              Be updated with all the latest trends, products, and insights
              in AI, web development, and design.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-grayDark text-secondary 
                           placeholder-grayMedium focus:outline-none focus:ring-2 
                           focus:ring-secondary"
                required
              />
              <Button
                type="submit"
                variant="secondary"
                loading={isLoading}
                className="w-full text-white border-white hover:text-white sm:w-auto"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-grayDark text-center">
          <p className="text-grayMedium">
            © {new Date().getFullYear()} IVP Africa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;