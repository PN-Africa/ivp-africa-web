'use client';
import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import AboutSection from '../components/sections/AboutSection';
import ServicesSection from '../components/sections/ServicesSection';
import PortfolioSection from '../components/sections/PortfolioSection';

// Define your background image path here (update with your actual asset path)
const backgroundImage = '/assets/bg1.jpg';

const HomePage: React.FC = () => {
  return (
    <main 
      className="bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed relative min-h-screen w-full overflow-x-hidden flex flex-col"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <HeroSection />
      <PortfolioSection />
      <AboutSection />
      <ServicesSection />
    </main>
  );
};

export default HomePage;