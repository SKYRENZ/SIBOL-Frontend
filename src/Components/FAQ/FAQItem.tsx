import React from "react";

const faqs = [
  "How long does the stage 1 process usually take?",
  "How do I properly segregate food waste?",
  "What food waste can be processed?",
  "How often should the machine be maintained?",
  "Is the system safe for households?",
];

interface FAQItemProps {
  onSelectFAQ: (faq: string) => void; // Updated: now accepts faq parameter
}

const FAQItem: React.FC<FAQItemProps> = ({ onSelectFAQ }) => {
  return (
    <div className="h-full px-6 sm:px-12 lg:px-20 py-12 lg:py-16 bg-white">
      <h3 className="text-[#7fa98a] font-semibold text-lg mb-10">
        Frequently Asked Questions:
      </h3>


      <div className="space-y-4">
        {faqs.map((q, i) => (
          <button
            key={i}
className="w-full flex items-center justify-between px-6 py-4 rounded-xl bg-[#94b59a] text-white text-sm hover:bg-[#7fa98a] shadow-md hover:shadow-lg transition-all duration-300focus:outline-none focus:ring-0 active:outline-none"            
               onClick={() => onSelectFAQ(q)} // Pass the FAQ text
          >
            <span className="text-left">{q}</span>
            <span className="text-lg">{">"}</span>
          </button>
        ))}
      </div>

      <p className="mt-14 text-xs text-right text-[#7fa98a]">
      Contact us:{" "}
      <a
        href="mailto:sibolhelp@gmail.com"
        className="underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        sibolhelp@gmail.com
      </a>
    </p>
    </div>
  );
};

export default FAQItem;
