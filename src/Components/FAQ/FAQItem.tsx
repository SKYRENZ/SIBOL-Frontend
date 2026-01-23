import React from "react";

const faqs = [
  "How long does the stage 1 process usually take?",
  "How do I properly segregate food waste?",
  "What food waste can be processed?",
  "How often should the machine be maintained?",
  "Is the system safe for households?",
];

interface FAQItemProps {
  onSelectFAQ: (faq: string) => void;
  isChatMode?: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({
  onSelectFAQ,
  isChatMode = false,
}) => {
  return (
    <div
      className={`relative h-full px-6 sm:px-12 lg:px-20 py-12 lg:py-16 overflow-hidden
        ${isChatMode ? "bg-[#f4f9f4]" : "bg-white"}`}
    >
      {/* TITLE */}
      <h3 className="text-[#7fa98a] font-semibold text-lg mb-10">
        Frequently Asked Questions:
      </h3>

      {/* FAQ LIST */}
      <div className="space-y-4 relative z-10">
        {faqs.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelectFAQ(q)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm transition shadow
              ${
                isChatMode
                  ? "bg-white text-[#4f7f63] hover:bg-[#eef5ef]"
                  : "bg-[#94b59a] text-white hover:bg-[#7fa98a]"
              }`}
          >
            <span className="text-left">{q}</span>
            <span className="text-lg">{">"}</span>
          </button>
        ))}
      </div>

      {/* CONTACT */}
      <p
        className={`text-xs text-[#7fa98a]
          ${isChatMode ? "absolute bottom-6 right-8" : "mt-14 text-right"}`}
      >
        Contact us:{" "}
        <a
          href="mailto:sibolhelp@gmail.com"
          className="underline text-[#4f7f63]"
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
