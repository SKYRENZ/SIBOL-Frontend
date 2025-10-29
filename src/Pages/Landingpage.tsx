import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Leaf, Recycle, Zap, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const carouselImages = [
    { src: '/src/assets/images/MIT-Food-Scraps.jpg', alt: 'Food Waste Management' },
    { src: '/src/assets/images/MIT-Food-Scraps.jpg', alt: 'Collection Schedule' },
    { src: '/src/assets/images/MIT-Food-Scraps.jpg', alt: 'Reward System' },
    { src: '/src/assets/images/MIT-Food-Scraps.jpg', alt: 'Energy Conversion' },
    { src: '/src/assets/images/MIT-Food-Scraps.jpg', alt: 'Community Impact' }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-[6650px] mx-auto px-[22.8px] py-[15.2px] flex items-center justify-between">
          <div className="flex items-center gap-[7.6px]">
            <img 
              src="/src/assets/images/SIBOLOGOBULB.png" 
              alt="SIBOL Logo" 
              className="h-[30.4px] w-[30.4px]"
            />
            <span className="text-[19px] font-bold text-[#2D5F2E]">SIBOL</span>
          </div>
          <button
            onClick={handleSignIn}
            className="px-[22.8px] py-[7.6px] bg-[#2D5F2E] text-white rounded-lg hover:bg-[#234A23] transition-colors duration-200 font-medium text-[15.2px]"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-16 sm:pb-20 md:pb-24 lg:pb-32 px-4 sm:px-6 md:px-8 lg:px-12 relative overflow-hidden min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex items-center">
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
          <div className="max-w-full sm:max-w-[650px] md:max-w-[750px] space-y-6 sm:space-y-8 md:space-y-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-bold text-gray-900 leading-tight">
              Make your food waste
              <br />
              <span className="text-[#2D5F2E]">powerful.</span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed max-w-[600px]">
              Transform your food waste into renewable energy. Join SIBOL's innovative 
              waste-to-energy program and contribute to a sustainable future while earning rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6">
              <button
                onClick={handleGetStarted}
                className="px-8 sm:px-10 md:px-12 lg:px-14 py-4 sm:py-5 md:py-6 bg-[#2D5F2E] text-white rounded-xl hover:bg-[#234A23] transition-all duration-200 font-semibold text-base sm:text-lg md:text-xl shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started
              </button>
              <button
                onClick={handleLearnMore}
                className="px-8 sm:px-10 md:px-12 lg:px-14 py-4 sm:py-5 md:py-6 border-2 border-[#2D5F2E] text-[#2D5F2E] rounded-xl hover:bg-[#2D5F2E] hover:text-white transition-all duration-200 font-semibold text-base sm:text-lg md:text-xl shadow-md hover:shadow-lg hover:scale-105"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Carousel Section */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 bg-[#E8F5E9]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            Check Our Features
          </h2>

          <div className="relative max-w-[900px] mx-auto px-4 sm:px-6">
            {/* Carousel Container with overlapping cards */}
            <div className="relative h-[280px] sm:h-[320px] md:h-[380px] flex items-center justify-center">
              {/* Previous card (left) - partially visible */}
              <div className="absolute left-0 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 w-[160px] sm:w-[190px] md:w-[220px] h-[180px] sm:h-[210px] md:h-[250px] rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-lg opacity-40 scale-90 z-0 transition-all duration-500">
                <img
                  src={carouselImages[(currentSlide - 1 + carouselImages.length) % carouselImages.length].src}
                  alt="Previous"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Main/Center card */}
              <div className="relative w-[250px] sm:w-[340px] md:w-[430px] lg:w-[500px] h-[210px] sm:h-[270px] md:h-[320px] rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl z-20 transition-all duration-500">
                <img
                  src={carouselImages[currentSlide].src}
                  alt={carouselImages[currentSlide].alt}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows on main card */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-30"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-30"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                </button>
              </div>

              {/* Next card (right) - partially visible */}
              <div className="absolute right-0 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 w-[160px] sm:w-[190px] md:w-[220px] h-[180px] sm:h-[210px] md:h-[250px] rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-lg opacity-40 scale-90 z-0 transition-all duration-500">
                <img
                  src={carouselImages[(currentSlide + 1) % carouselImages.length].src}
                  alt="Next"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-[#2D5F2E] w-8 shadow-md'
                      : 'bg-gray-300 w-2 hover:bg-gray-400 hover:w-4'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Feature Description */}
            <div className="text-center mt-6 px-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Smart Collection Scheduling</h3>
              <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                Schedule your waste collection at your convenience. Our smart system optimizes routes 
                and ensures timely pickup, making waste management effortless for you.
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
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 lg:px-12 bg-white">
        <div className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            Frequently Asked Questions
          </h2>

          <div className="bg-[#E8F5E9] rounded-xl sm:rounded-2xl lg:rounded-[19px] p-4 sm:p-6 md:p-8 lg:p-[30.4px] space-y-3 sm:space-y-4 lg:space-y-[15.2px]">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg sm:rounded-xl lg:rounded-[15.2px] overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-5 md:px-6 lg:px-[22.8px] py-3 sm:py-4 lg:py-[15.2px] flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base lg:text-[15.2px] pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-[19px] lg:h-[19px] text-gray-600 transition-transform duration-300 flex-shrink-0 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-4 sm:px-5 md:px-6 lg:px-[22.8px] pb-3 sm:pb-4 lg:pb-[15.2px] text-gray-600 leading-relaxed text-sm sm:text-base lg:text-[14.25px]">
                    {faq.answer}
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