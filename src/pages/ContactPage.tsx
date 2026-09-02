'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { PLACEHOLDERS } from '../utils/placeholders';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import Button from '../components/common/Button';
import SocialLinks from '../components/common/SocialLinks';
import { useForm } from '../hooks/useForm';
import { CONTACT_INFO } from '../utils/constants';
import { isValidEmail, formatPhoneNumber } from '../utils/helpers';
import { sendContactMessage } from '../services/api';
import type { ContactFormData } from '../types';

const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (values: ContactFormData): Partial<Record<keyof ContactFormData, string>> => {
    const errors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!values.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!values.country.trim()) {
      errors.country = 'Country is required';
    }

    if (!values.message.trim()) {
      errors.message = 'Message is required';
    } else if (values.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    return errors;
  };

  const handleSubmit = async (values: ContactFormData) => {
    const toastStyles = {
      style: { background: 'black', color: 'white', border: '1px solid #8c52ff', borderRadius: '0px' },
      iconTheme: { primary: '#8c52ff', secondary: 'white' }
    };

    setIsSubmitting(true);
    try {
      await sendContactMessage(values);
      toast.success("Message sent successfully! We'll get back to you soon.", toastStyles);
    } catch {
      toast.error('Failed to send message. Please try again.', toastStyles);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { values, errors, handleChange, handleSubmit: onSubmit } = useForm<ContactFormData>({
    initialValues: {
      name: '',
      email: '',
      country: '',
      message: '',
    },
    onSubmit: handleSubmit,
    validate,
  });

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-[#8c52ff] selection:text-white overflow-x-hidden">

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 bg-gradient-to-b from-[#8c52ff]/10 to-white border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-black mb-4 sm:mb-6 tracking-tight">
              Get in <span className="font-semibold text-[#8c52ff]">Touch</span>
            </h1>
            <p className="text-black/50 text-base sm:text-lg md:text-xl max-w-2xl mx-auto tracking-wide px-4">
              Have a question in mind? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map Section - Responsive heights applied */}
      <section className="h-[250px] sm:h-[350px] md:h-[400px] w-full border-b border-black/5 bg-black/5">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.62283124574!2d3.1438721!3d6.5480357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1679000000000!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
          className="grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-700 ease-in-out"
        />
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            
            {/* Contact Image & Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-10 md:space-y-12"
            >
              {/* Image with offset border */}
              <div className="relative mb-8 md:mb-12 max-w-md mx-auto lg:mx-0">
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-full h-full border border-[#8c52ff] z-0 transition-transform duration-500 hover:translate-x-2 hover:translate-y-2"></div>
                <div className="relative z-10 bg-white p-2 shadow-sm border border-black/10">
                  <img
                    src="/assets/contact1.png"
                    alt="Our Office"
                    className="w-full h-[250px] sm:h-[300px] object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = PLACEHOLDERS.contact;
                    }}
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-6 md:space-y-8">
                <h2 className="text-xl sm:text-2xl text-black uppercase tracking-widest border-b border-black/10 pb-4">
                  Contact <span className="font-medium text-[#8c52ff]">Information</span>
                </h2>
                
                <div className="space-y-4">
                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 border border-black/10 hover:border-black transition-colors group bg-white"
                  >
                    <div className="text-black/40 group-hover:text-[#8c52ff] transition-colors text-xl sm:text-2xl shrink-0">
                      <FaPhone />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase tracking-widest text-black/40 mb-1">Phone</p>
                      <p className="font-medium text-sm sm:text-base text-black tracking-wide">{formatPhoneNumber(CONTACT_INFO.phone)}</p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 border border-black/10 hover:border-black transition-colors group bg-white"
                  >
                    <div className="text-black/40 group-hover:text-[#8c52ff] transition-colors text-xl sm:text-2xl shrink-0">
                      <FaEnvelope />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs uppercase tracking-widest text-black/40 mb-1">Email</p>
                      <p className="font-medium text-sm sm:text-base text-black tracking-wide break-all sm:break-words">{CONTACT_INFO.email}</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 border border-black/10 bg-white">
                    <div className="text-[#8c52ff] text-xl sm:text-2xl shrink-0">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase tracking-widest text-black/40 mb-1">Location</p>
                      <p className="font-medium text-sm sm:text-base text-black tracking-wide">{CONTACT_INFO.location}</p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-6 sm:pt-8 border-t border-black/10">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-black/40 mb-4 sm:mb-6">Connect via Socials</p>
                  <SocialLinks variant="dark" size="md" />
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-8 lg:mt-0"
            >
              <div className="p-6 sm:p-8 md:p-12 border border-black/10 bg-white shadow-sm">
                <h2 className="text-2xl sm:text-3xl text-black mb-2">
                  Send a <span className="font-medium text-[#8c52ff]">Message</span>
                </h2>
                <p className="text-black/50 mb-8 sm:mb-10 text-sm sm:text-base font-light tracking-wide">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={onSubmit} className="space-y-8">
                  {/* Name Field */}
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      aria-label="Full Name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className={`w-full bg-transparent border-b ${errors.name ? 'border-[#8c52ff]' : 'border-black/20 focus:border-black'} py-3 text-sm sm:text-base text-black placeholder:text-black/30 outline-none transition-colors rounded-none`}
                    />
                    {errors.name && (
                      <p className="absolute -bottom-5 left-0 text-[10px] sm:text-xs tracking-wide text-[#8c52ff]">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      aria-label="Email Address"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className={`w-full bg-transparent border-b ${errors.email ? 'border-[#8c52ff]' : 'border-black/20 focus:border-black'} py-3 text-sm sm:text-base text-black placeholder:text-black/30 outline-none transition-colors rounded-none`}
                    />
                    {errors.email && (
                      <p className="absolute -bottom-5 left-0 text-[10px] sm:text-xs tracking-wide text-[#8c52ff]">{errors.email}</p>
                    )}
                  </div>

                  {/* Country Field */}
                  <div className="relative">
                    <input
                      type="text"
                      id="country"
                      name="country"
                      aria-label="Country"
                      value={values.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className={`w-full bg-transparent border-b ${errors.country ? 'border-[#8c52ff]' : 'border-black/20 focus:border-black'} py-3 text-sm sm:text-base text-black placeholder:text-black/30 outline-none transition-colors rounded-none`}
                    />
                    {errors.country && (
                      <p className="absolute -bottom-5 left-0 text-[10px] sm:text-xs tracking-wide text-[#8c52ff]">{errors.country}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="relative pt-4">
                    <textarea
                      id="message"
                      name="message"
                      aria-label="Your Message"
                      value={values.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project or inquiry..."
                      rows={4}
                      className={`w-full bg-transparent border ${errors.message ? 'border-[#8c52ff]' : 'border-black/20 focus:border-black'} p-3 sm:p-4 text-sm sm:text-base text-black placeholder:text-black/30 outline-none transition-colors resize-none rounded-none`}
                    />
                    {errors.message && (
                      <p className="absolute -bottom-5 left-0 text-[10px] sm:text-xs tracking-wide text-[#8c52ff]">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-black text-white hover:bg-[#8c52ff] disabled:opacity-50 disabled:hover:bg-black transition-colors text-xs sm:text-sm uppercase tracking-widest font-medium text-center"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                    <Button
                      href={CONTACT_INFO.serviceFormUrl}
                      external
                      className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-white text-black border border-black hover:bg-black hover:border-white hover:text-white transition-colors text-xs sm:text-sm uppercase tracking-widest font-medium text-center flex items-center justify-center rounded-none"
                    >
                      Request a Service
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;