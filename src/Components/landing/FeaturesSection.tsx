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
    <section id="features-section" className="py-8 sm:py-10 md:py-12 lg:py-10 px-3 sm:px-5 md:px-6 bg-[#E8F5E9] dark:bg-[#E8F5E9] snap-start scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-900 dark:text-gray-900 mb-2">
          Check Our Features
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-8 text-xs sm:text-sm md:text-base">
          Our SIBOL Project will help your community grow with innovation. Your trash can be energy that flows through your community.
        </p>

        <div className="relative max-w-[750px] mx-auto px-2 sm:px-4 md:px-6">
          {/* Carousel Container */}
          <div className="relative h-[150px] sm:h-[180px] md:h-[210px] lg:h-[240px] flex items-center justify-center">
            {/* Previous card (left) - partially visible */}
            <div className="absolute left-0 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 w-[120px] sm:w-[180px] md:w-[230px] lg:w-[270px] h-[90px] sm:h-[130px] md:h-[160px] lg:h-[180px] rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-xl opacity-50 scale-90 z-0 transition-all duration-500">
              <img
                src={slides[(currentSlide - 1 + slides.length) % slides.length].src}
                alt="Previous"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Main/Center card with text overlay */}
            <div className="relative w-[240px] sm:w-[340px] md:w-[440px] lg:w-[500px] h-[130px] sm:h-[170px] md:h-[210px] lg:h-[240px] rounded-[20px] sm:rounded-[24px] md:rounded-[28px] overflow-hidden shadow-2xl z-20 transition-all duration-500">
              <img
                ref={mainImageRef}
                src={slides[currentSlide].src}
                alt={slides[currentSlide].alt}
                className="w-full h-full object-cover"
              />

              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>

              {/* Text overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 lg:p-5 z-20">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl">{slides[currentSlide].emoji}</span>
                </div>
                <h3
                  className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white dark:text-white mb-0.5"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {slides[currentSlide].title}
                </h3>
                <p
                  className="text-[10px] sm:text-xs md:text-sm text-white/95 dark:text-white/95 font-medium"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {slides[currentSlide].subtitle}
                </p>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 p-0 bg-[#2D5F2E] hover:bg-[#234A23] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-30"
                aria-label="Previous slide"
              >
                <ArrowLeft size={16} strokeWidth={2.75} color="#ffffff" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 p-0 bg-[#2D5F2E] hover:bg-[#234A23] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-30"
                aria-label="Next slide"
              >
                <ArrowRight size={16} strokeWidth={2.75} color="#ffffff" />
              </button>
            </div>

            {/* Next card (right) - partially visible */}
            <div className="absolute right-0 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 w-[120px] sm:w-[180px] md:w-[230px] lg:w-[270px] h-[90px] sm:h-[130px] md:h-[160px] lg:h-[180px] rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-xl opacity-50 scale-90 z-0 transition-all duration-500">
              <img
                src={slides[(currentSlide + 1) % slides.length].src}
                alt="Next"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-1 sm:gap-1.5 mt-3 sm:mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-[#2D5F2E] dark:bg-[#2D5F2E] w-5 sm:w-6 shadow-md'
                    : 'bg-gray-400 dark:bg-gray-400 w-1.5 hover:bg-gray-500 dark:hover:bg-gray-500 hover:w-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Feature Description below carousel */}
          <div className="text-center mt-3 sm:mt-5 px-3 max-w-xl mx-auto">
            <p className="text-gray-700 dark:text-gray-700 text-[10px] sm:text-xs md:text-sm leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
