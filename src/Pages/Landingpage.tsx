import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated } from '../services/authService';
import { getLandingRoute } from '../utils/routeUtils';
import GameSelector from '../Components/common/GameSelector';
import {
  LandingHeader,
  HeroSection,
  FeaturesSection,
  DecorativeWave,
  WhatIsSibolSection,
  EnvironmentalImpactSection,
  WhyFoodWasteMattersSection,
  FAQSection,
  ContactSection,
  LandingFooter
} from '../Components/landing';

const Landingpage: React.FC = () => {
  const navigate = useNavigate();
  const [gameOpen, setGameOpen] = useState(false);

  // Import images using new URL()
  const SibolWordLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href;
  const LandingBG = new URL('../assets/images/LandingBG.png', import.meta.url).href;
  const Photo1 = new URL('../assets/images/photo.png', import.meta.url).href;
  const Photo2 = new URL('../assets/images/photo2.png', import.meta.url).href;
  const Photo3 = new URL('../assets/images/photo3.png', import.meta.url).href;
  const Photo4 = new URL('../assets/images/photo4.png', import.meta.url).href;
  const Photo5 = new URL('../assets/images/photo5.png', import.meta.url).href;
  const Photo7 = new URL('../assets/images/photo7.png', import.meta.url).href;
  const SibolLogoBulb = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href;
  const TrashBG = new URL('../assets/images/TRASHBG.png', import.meta.url).href;

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      navigate(getLandingRoute(user), { replace: true });
    }
  }, [navigate]);

  // Carousel slides data
  const carouselSlides = [
    {
      src: Photo1,
      alt: 'Smart Food Waste Collection',
      emoji: '🌱',
      title: 'Smart Food Waste Collection',
      subtitle: 'From Kitchen Waste to Clean Energy',
      description: 'SIBOL gathers and processes household food waste from the pilot barangay, preparing it for anaerobic digestion. Every scrap and food waste collected becomes part of a sustainable energy cycle.'
    },
    {
      src: Photo2,
      alt: 'Continuous Anaerobic Digestion',
      emoji: '⚙️',
      title: 'Continuous Anaerobic Digestion',
      subtitle: 'Sustainable Power in Motion',
      description: 'Through continuous digestion, food waste is transformed into biogas. The system monitors temperature and retention time to ensure stable, efficient, and eco-friendly energy generation.'
    },
    {
      src: Photo3,
      alt: 'Biogas-to-Electricity Conversion',
      emoji: '⚡',
      title: 'Biogas-to-Electricity Conversion',
      subtitle: 'Turning Biogas into Bright Homes',
      description: 'Generated biogas is converted into usable electricity through small generators, powering households within the pilot barangay and showcasing the potential of renewable community energy.'
    },
    {
      src: Photo4,
      alt: 'IoT Monitoring & Smart Dashboard',
      emoji: '📡',
      title: 'IoT Monitoring & Smart Dashboard',
      subtitle: 'Data-Driven Efficiency',
      description: 'IoT sensors track real-time parameters—temperature, pH, gas flow—and feed them into an interactive dashboard that visualizes performance, energy output, and system health at a glance.'
    },
    {
      src: Photo5,
      alt: 'AI Optimization & Maintenance',
      emoji: '🤖',
      title: 'AI Optimization & Maintenance',
      subtitle: 'Smarter Systems, Stronger Performance',
      description: 'AI continuously analyzes system data to optimize digestion processes, predict potential issues, and automate alerts—keeping SIBOL running efficiently with minimal human intervention.'
    },
    {
      src: Photo7,
      alt: 'User Support & Security',
      emoji: '💬',
      title: 'User Support & Security',
      subtitle: 'Empowering People, Protecting Data',
      description: 'With an AI chatbot, ticketing system, and secure access control, SIBOL ensures quick user support, transparent issue tracking, and safe, role-based management for barangay officials and researchers.'
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How will this help me save?",
      answer: "Our system helps you track and reduce food waste, which directly translates to savings on your grocery bills. By converting waste to energy, you can also reduce electricity costs."
    },
    {
      question: "What is your food waste?",
      answer: "Food waste refers to any edible food that is discarded, lost, or uneaten. This includes leftovers, spoiled produce, and expired items that could have been consumed."
    },
    {
      question: "What can I do?",
      answer: "You can start by segregating your food waste, using our app to track your waste generation, scheduling pickups, and monitoring how your waste is converted into renewable energy."
    },
    {
      question: "Will my payment support?",
      answer: "Yes! All payments go directly towards maintaining and expanding our waste-to-energy infrastructure, helping create a more sustainable future for everyone."
    }
  ];

  return (
    <div className="bg-white dark:bg-white snap-y snap-mandatory overflow-y-auto h-screen">
      <LandingHeader logoSrc={SibolWordLogo} />
      <HeroSection trashBgSrc={TrashBG} onOpenGame={() => setGameOpen(true)} />
      <FeaturesSection slides={carouselSlides} />
      <DecorativeWave />
      <WhatIsSibolSection />
      <EnvironmentalImpactSection />
      <WhyFoodWasteMattersSection />
      <FAQSection faqs={faqs} />
      <ContactSection />
      <LandingFooter logoSrc={SibolLogoBulb} />
      <GameSelector isOpen={gameOpen} onClose={() => setGameOpen(false)} />
    </div>
  );
};

export default Landingpage;
