import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, Leaf, Zap, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';
import { isAuthenticated } from '../services/auth';

const Landingpage: React.FC = () => {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const carouselSlides = [
    { 
      src: '/src/assets/images/photo.png', 
      alt: 'Smart Food Waste Collection',
      emoji: '🌱',
      title: 'Smart Food Waste Collection',
      subtitle: 'From Kitchen Waste to Clean Energy',
      description: 'SIBOL gathers and processes household food waste from the pilot barangay, preparing it for anaerobic digestion. Every scrap collected becomes part of a sustainable energy cycle.'
    },
    { 
      src: '/src/assets/images/photo2.png', 
      alt: 'Continuous Anaerobic Digestion',
      emoji: '⚙️',
      title: 'Continuous Anaerobic Digestion',
      subtitle: 'Sustainable Power in Motion',
      description: 'Through continuous digestion, food waste is transformed into biogas. The system monitors temperature and retention time to ensure stable, efficient, and eco-friendly energy generation.'
    },
    { 
      src: '/src/assets/images/photo3.png', 
      alt: 'Biogas-to-Electricity Conversion',
      emoji: '⚡',
      title: 'Biogas-to-Electricity Conversion',
      subtitle: 'Turning Biogas into Bright Homes',
      description: 'Generated biogas is converted into usable electricity through small generators, powering households within the pilot barangay and showcasing the potential of renewable community energy.'
    },
    { 
      src: '/src/assets/images/photo4.png', 
      alt: 'IoT Monitoring & Smart Dashboard',
      emoji: '📡',
      title: 'IoT Monitoring & Smart Dashboard',
      subtitle: 'Data-Driven Efficiency',
      description: 'IoT sensors track real-time parameters—temperature, pH, gas flow—and feed them into an interactive dashboard that visualizes performance, energy output, and system health at a glance.'
    },
    { 
      src: '/src/assets/images/photo5.png', 
      alt: 'AI Optimization & Maintenance',
      emoji: '🤖',
      title: 'AI Optimization & Maintenance',
      subtitle: 'Smarter Systems, Stronger Performance',
      description: 'AI continuously analyzes system data to optimize digestion processes, predict potential issues, and automate alerts—keeping SIBOL running efficiently with minimal human intervention.'
    },
    { 
      src: '/src/assets/images/photo7.png', 
      alt: 'User Support & Security',
      emoji: '💬',
      title: 'User Support & Security',
      subtitle: 'Empowering People, Protecting Data',
      description: 'With an AI chatbot, ticketing system, and secure access control, SIBOL ensures quick user support, transparent issue tracking, and safe, role-based management for barangay officials and researchers.'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLearnMore = () => {
    const element = document.getElementById('about-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

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
    <div className="min-h-screen bg-white dark:bg-white">
      {/* Header - White, 15% smaller with SIBOL word logo */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-white backdrop-blur-sm z-50 shadow-md border-b border-gray-100 dark:border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-[15px] py-2.5 sm:py-3.5 md:py-4 lg:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-3.5">
            <img 
              src="/src/assets/images/SIBOLWORDLOGO.png" 
              alt="SIBOL Logo" 
              className="h-7 sm:h-8 md:h-9 lg:h-[43px]"
            />
          </div>
          <button
            onClick={handleSignIn}
            className="px-3.5 sm:px-4 md:px-5 lg:px-7 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-[#2D5F2E] dark:bg-[#2D5F2E] text-white dark:text-white rounded-lg hover:bg-[#234A23] dark:hover:bg-[#234A23] transition-colors duration-200 font-semibold text-xs sm:text-sm md:text-base lg:text-lg shadow-md"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section - Fully visible with proper spacing */}
      <section className="pt-24 sm:pt-26 md:pt-29 lg:pt-32 pb-12 sm:pb-16 md:pb-20 lg:pb-24 px-4 sm:px-6 md:px-8 lg:px-12 relative overflow-hidden min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/LandingBG.png" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="max-w-full sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] space-y-6 sm:space-y-7 md:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-bold text-gray-900 dark:text-gray-900 leading-tight">
              Make your food waste
              <br />
              <span className="text-[#2D5F2E] dark:text-[#2D5F2E]">powerful.</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-600 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed max-w-[650px]">
              Transform your food waste into renewable energy. Join SIBOL's innovative 
              waste-to-energy program and contribute to a sustainable future while earning rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 sm:px-7 md:px-8 lg:px-10 py-3 sm:py-3.5 md:py-4 bg-[#5F8D4E] text-white rounded-full font-semibold text-base sm:text-lg hover:bg-[#4a6d3d] transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
              <button
                onClick={() => {
                  const howItWorksSection = document.getElementById('how-it-works');
                  howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 sm:px-7 md:px-8 lg:px-10 py-3 sm:py-3.5 md:py-4 bg-white text-[#5F8D4E] border-2 border-[#5F8D4E] rounded-full font-semibold text-base sm:text-lg hover:bg-[#5F8D4E] hover:text-white transition-colors shadow-lg hover:shadow-xl"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Carousel Section - Text 20% smaller, Images 40% bigger */}
      <section className="py-10 sm:py-11 md:py-13 lg:py-16 px-3 sm:px-5 md:px-6 bg-[#E8F5E9] dark:bg-[#E8F5E9]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-gray-900 mb-2">
            Check Our Features
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-24 text-xs sm:text-sm md:text-base lg:text-lg">
            Our SIBOL Project will help your community grow with innovation. Your trash can be energy that flows through your community.
          </p>

          <div className="relative max-w-[1100px] mx-auto px-2 sm:px-4 md:px-6">
            {/* Carousel Container - Images 40% bigger */}
            <div className="relative h-[294px] sm:h-[343px] md:h-[392px] lg:h-[441px] flex items-center justify-center">
              {/* Previous card (left) - partially visible */}
              <div className="absolute left-0 sm:left-2 md:left-4 lg:left-8 top-1/2 -translate-y-1/2 w-[176px] sm:w-[216px] md:w-[274px] lg:w-[314px] h-[196px] sm:h-[235px] md:h-[274px] lg:h-[314px] rounded-[24px] sm:rounded-[31px] overflow-hidden shadow-xl opacity-50 scale-90 z-0 transition-all duration-500">
                <img
                  src={carouselSlides[(currentSlide - 1 + carouselSlides.length) % carouselSlides.length].src}
                  alt="Previous"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Main/Center card with text overlay - 40% bigger */}
              <div className="relative w-[274px] sm:w-[372px] md:w-[470px] lg:w-[568px] h-[235px] sm:h-[294px] md:h-[353px] lg:h-[392px] rounded-[28px] sm:rounded-[35px] md:rounded-[43px] overflow-hidden shadow-2xl z-20 transition-all duration-500">
                <img
                  src={carouselSlides[currentSlide].src}
                  alt={carouselSlides[currentSlide].alt}
                  className="w-full h-full object-cover"
                />
                
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
                
                {/* Text overlay on image */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-7 z-20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">{carouselSlides[currentSlide].emoji}</span>
                  </div>
                  <h3 
                    className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-white dark:text-white mb-1"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    {carouselSlides[currentSlide].title}
                  </h3>
                  <p 
                    className="text-xs sm:text-sm md:text-base text-white/95 dark:text-white/95 font-medium"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    {carouselSlides[currentSlide].subtitle}
                  </p>
                </div>
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white/90 dark:bg-white/90 hover:bg-white dark:hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-30"
                  aria-label="Previous slide"
                >
                  <Recycle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-gray-800" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white/90 dark:bg-white/90 hover:bg-white dark:hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-30"
                  aria-label="Next slide"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-gray-800" />
                </button>
              </div>

              {/* Next card (right) - partially visible */}
              <div className="absolute right-0 sm:right-2 md:right-4 lg:right-8 top-1/2 -translate-y-1/2 w-[176px] sm:w-[216px] md:w-[274px] lg:w-[314px] h-[196px] sm:h-[235px] md:h-[274px] lg:h-[314px] rounded-[24px] sm:rounded-[31px] overflow-hidden shadow-xl opacity-50 scale-90 z-0 transition-all duration-500">
                <img
                  src={carouselSlides[(currentSlide + 1) % carouselSlides.length].src}
                  alt="Next"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Carousel Dots - 20% smaller */}
            <div className="flex justify-center gap-1 sm:gap-1.5 mt-4 sm:mt-5 md:mt-6">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-[#2D5F2E] dark:bg-[#2D5F2E] w-6 sm:w-6 shadow-md'
                      : 'bg-gray-400 dark:bg-gray-400 w-1.5 sm:w-2 hover:bg-gray-500 dark:hover:bg-gray-500 hover:w-3 sm:hover:w-4'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Feature Description below carousel - 20% smaller */}
            <div className="text-center mt-4 sm:mt-5 md:mt-6 px-3 max-w-2xl mx-auto">
              <p className="text-gray-700 dark:text-gray-700 text-[10px] sm:text-xs md:text-sm leading-relaxed">
                {carouselSlides[currentSlide].description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Wave */}
      <div className="w-full h-[121.6px] bg-[#E8F5E9]">
        <svg viewBox="0 0 1440 120" className="w-full h-full">
          <path
            fill="#88AB8E"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </div>

      {/* What is SIBOL Section */}
      <section id="about-section" className="py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#88AB8E]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white mb-4 sm:mb-5 md:mb-6">
            What is SIBOL Project?
          </h2>
          <p className="text-center text-white/90 max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20 lg:mb-24 leading-relaxed text-base sm:text-lg md:text-xl px-4">
            SIBOL is an innovative waste management system that transforms food waste into renewable energy. 
            We use reward-based incentives to encourage proper waste segregation, creating a sustainable cycle 
            that benefits both the environment and our community.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 sm:p-10 md:p-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#2D5F2E] rounded-full flex items-center justify-center mb-5 sm:mb-6">
                <Recycle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Food Waste Segregation
              </h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Our smart system helps you properly segregate food waste at the source, 
                making the conversion process more efficient and environmentally friendly.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 sm:p-10 md:p-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#2D5F2E] rounded-full flex items-center justify-center mb-5 sm:mb-6">
                <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Reward-Based System
              </h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Earn points and rewards for every kilogram of food waste you contribute. 
                Redeem your points for discounts, vouchers, and other exciting benefits.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 sm:p-10 md:p-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#2D5F2E] rounded-full flex items-center justify-center mb-5 sm:mb-6">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Biogas to Electricity
              </h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Your food waste is converted into biogas through anaerobic digestion, 
                which is then transformed into clean, renewable electricity for the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Impact Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mb-4 sm:mb-5 md:mb-6">
            Our Environmental Impact
          </h2>
          <p className="text-center text-gray-600 max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20 lg:mb-24 leading-relaxed text-base sm:text-lg md:text-xl px-4">
            Together, we're making a real difference in reducing carbon emissions and promoting sustainable energy.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            <div className="text-center p-8 sm:p-10 md:p-12 bg-[#E8F5E9] rounded-2xl">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#2D5F2E] mb-3 sm:mb-4">50+</div>
              <div className="text-gray-700 font-semibold text-lg sm:text-xl md:text-2xl">Tons of Waste Processed</div>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">Monthly average</p>
            </div>

            <div className="text-center p-8 sm:p-10 md:p-12 bg-[#E8F5E9] rounded-2xl">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#2D5F2E] mb-3 sm:mb-4">30%</div>
              <div className="text-gray-700 font-semibold text-lg sm:text-xl md:text-2xl">CO₂ Reduction</div>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">Compared to landfills</p>
            </div>

            <div className="text-center p-8 sm:p-10 md:p-12 bg-[#E8F5E9] rounded-2xl sm:col-span-2 lg:col-span-1">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#2D5F2E] mb-3 sm:mb-4">1000+</div>
              <div className="text-gray-700 font-semibold text-lg sm:text-xl md:text-2xl">Active Households</div>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">And growing</p>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 bg-gradient-to-r from-[#2D5F2E] to-[#4A7C4E] rounded-2xl p-8 sm:p-10 md:p-12 lg:p-16 text-white">
            <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6">Why Food Waste Matters</h3>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 md:mb-12">
                Food waste in landfills produces methane, a greenhouse gas 25 times more potent than CO₂. 
                By converting food waste to energy, we're not just reducing waste—we're actively fighting climate change.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 sm:p-8 md:p-10">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">1.3B</div>
                  <div className="text-sm sm:text-base md:text-lg">Tons of food wasted globally per year</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 sm:p-8 md:p-10">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">8%</div>
                  <div className="text-sm sm:text-base md:text-lg">Of global greenhouse gas emissions from food waste</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 lg:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-black font-bold text-center mb-3 sm:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-center mb-10 sm:mb-12 md:mb-16 text-base sm:text-lg">
            Find answers to common questions about SIBOL
          </p>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex justify-between items-center text-left bg-white hover:bg-gray-50 transition-colors outline-none focus:outline-none border-none"
                >
                  <span className="font-semibold text-gray-900 text-base sm:text-lg pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-[#88AB8E] transition-transform duration-200 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-5 sm:px-6 md:px-8 pb-4 sm:pb-5 md:pb-6 bg-white">
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#88AB8E]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 md:gap-16 lg:gap-20">
          {/* Contact Info */}
          <div className="text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-6">
              Let's discuss
              <br />
              on something <span className="text-[#2D5F2E]">cool</span>
              <br />
              together
            </h2>
            
            <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-[22.8px] mt-6 sm:mt-7 md:mt-8 lg:mt-[30.4px]">
              <div className="flex items-start gap-[15.2px]">
                <div className="w-[38px] h-[38px] bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-[19px] h-[19px]" />
                </div>
                <div>
                  <div className="font-medium mb-[3.8px] text-[15.2px]">Email</div>
                  <a href="mailto:sibol@gmail.com" className="text-white/90 hover:text-white text-[14.25px]">
                    sibol@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-[15.2px]">
                <div className="w-[38px] h-[38px] bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-[19px] h-[19px]" />
                </div>
                <div>
                  <div className="font-medium mb-[3.8px] text-[15.2px]">Phone</div>
                  <a href="tel:+639123456789" className="text-white/90 hover:text-white text-[14.25px]">
                    +63 912 345 6789
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-[15.2px]">
                <div className="w-[38px] h-[38px] bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-[19px] h-[19px]" />
                </div>
                <div>
                  <div className="font-medium mb-[3.8px] text-[15.2px]">Location</div>
                  <div className="text-white/90 text-[14.25px]">
                    Camarines Norte, Philippines
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-[15.2px] mt-[30.4px]">
              <a
                href="#"
                className="w-[38px] h-[38px] bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
              >
                <svg className="w-[19px] h-[19px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-[38px] h-[38px] bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
              >
                <svg className="w-[19px] h-[19px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-[19px] p-6 sm:p-7 md:p-8 lg:p-[30.4px] shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-[15.2px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-[15.2px]">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="px-[15.2px] py-[11.4px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent text-[14.25px]"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="px-[15.2px] py-[11.4px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent text-[14.25px]"
                  required
                />
              </div>

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleFormChange}
                className="w-full px-[14.4px] py-[10.8px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent text-[13.6px]"
                required
              />

              <textarea
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleFormChange}
                rows={5}
                className="w-full px-[15.2px] py-[11.4px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent resize-none text-[14.25px]"
                required
              />

              <button
                type="submit"
                className="w-full px-[22.8px] py-[11.4px] bg-[#2D5F2E] text-white rounded-lg hover:bg-[#234A23] transition-colors duration-200 font-medium text-[15.2px]"
              >
                SEND MESSAGE
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D5F2E] text-white py-6 sm:py-7 md:py-8 lg:py-[30.4px] px-4 sm:px-6 md:px-8 lg:px-[22.8px]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 lg:gap-[7.6px] mb-3 sm:mb-4 lg:mb-[15.2px]">
            <img 
              src="/src/assets/images/SIBOLOGOBULB.png" 
              alt="SIBOL Logo" 
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-[30.4px] lg:w-[30.4px]"
            />
            <span className="text-base sm:text-lg md:text-xl lg:text-[19px] font-bold">SIBOL</span>
          </div>
          <p className="text-white/80 text-xs sm:text-sm lg:text-[13.3px] px-4">
            © 2024 SIBOL Project. All rights reserved. | Transforming waste into energy, one household at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landingpage;
