import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CarouselSlide {
  src: string;
  alt: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
}

interface FeaturesSectionProps {
  slides: CarouselSlide[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const mainImageRef = useRef<HTMLImageElement | null>(null);

  const animateMainImage = (direction: 'next' | 'prev') => {
    const imageEl = mainImageRef.current;

    if (!imageEl) return;

    imageEl.animate(
      [
        {
          opacity: 0.35,
          transform: `translateX(${direction === 'next' ? '22px' : '-22px'}) scale(0.98)`
        },
        {
          opacity: 1,
          transform: 'translateX(0) scale(1)'
        }
      ],
      {
        duration: 420,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      }
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    requestAnimationFrame(() => animateMainImage('next'));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    requestAnimationFrame(() => animateMainImage('prev'));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section id="features-section" className="h-screen min-h-[600px] max-h-[1080px] px-4 sm:px-6 md:px-8 py-16 sm:py-20 bg-[#E8F5E9] dark:bg-[#E8F5E9] snap-start flex items-center justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-900 mb-3 sm:mb-4">
          Check Our Features
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg">
          Our SIBOL Project will help your community grow with innovation. Your trash can be energy that flows through your community.
        </p>

        <div className="relative max-w-[750px] mx-auto px-4 sm:px-6">
          {/* Carousel Container */}
          <div className="relative h-[200px] sm:h-[220px] md:h-[260px] lg:h-[300px] flex items-center justify-center">
            {/* Previous card (left) - partially visible */}
            <div className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px] h-[110px] sm:h-[140px] md:h-[170px] lg:h-[200px] rounded-[18px] md:rounded-[20px] overflow-hidden shadow-xl opacity-50 scale-90 z-0 transition-all duration-500">
              <img
                src={slides[(currentSlide - 1 + slides.length) % slides.length].src}
                alt="Previous"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Main/Center card with text overlay */}
            <div className="relative w-[280px] sm:w-[340px] md:w-[420px] lg:w-[480px] h-[170px] sm:h-[200px] md:h-[250px] lg:h-[290px] rounded-[22px] md:rounded-[26px] overflow-hidden shadow-2xl z-20 transition-all duration-500">
              <img
                ref={mainImageRef}
                src={slides[currentSlide].src}
                alt={slides[currentSlide].alt}
                className="w-full h-full object-cover"
              />

              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>

              {/* Text overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 z-20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl sm:text-2xl md:text-3xl">{slides[currentSlide].emoji}</span>
                </div>
                <h3
                  className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white dark:text-white mb-1"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {slides[currentSlide].title}
                </h3>
                <p
                  className="text-xs sm:text-sm md:text-base text-white/95 dark:text-white/95 font-medium"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {slides[currentSlide].subtitle}
                </p>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 p-0 bg-[#2D5F2E] hover:bg-[#234A23] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-30"
                aria-label="Previous slide"
              >
                <ArrowLeft size={18} strokeWidth={2.75} color="#ffffff" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 p-0 bg-[#2D5F2E] hover:bg-[#234A23] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-30"
                aria-label="Next slide"
              >
                <ArrowRight size={18} strokeWidth={2.75} color="#ffffff" />
              </button>
            </div>

            {/* Next card (right) - partially visible */}
            <div className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px] h-[110px] sm:h-[140px] md:h-[170px] lg:h-[200px] rounded-[18px] md:rounded-[20px] overflow-hidden shadow-xl opacity-50 scale-90 z-0 transition-all duration-500">
              <img
                src={slides[(currentSlide + 1) % slides.length].src}
                alt="Next"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-2 mt-6 sm:mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`carousel-dot ${
                  index === currentSlide ? 'active' : 'inactive'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Feature Description below carousel */}
          <div className="text-center mt-6 sm:mt-8 px-4 max-w-2xl mx-auto">
            <p className="text-gray-700 dark:text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
