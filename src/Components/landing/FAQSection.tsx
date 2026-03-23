import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-14 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-gray-50 snap-start scroll-mt-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-black font-bold text-center mb-2 sm:mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 text-center mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base">
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
                className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 flex justify-between items-center text-left bg-white hover:bg-gray-50 transition-colors outline-none focus:outline-none border-none"
              >
                <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-[#88AB8E] transition-transform duration-200 ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFAQ === index && (
                <div className="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 bg-white">
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
