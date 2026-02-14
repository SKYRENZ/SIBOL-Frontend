import React, { useState } from "react";

const faqs = [
  {
    question: "How long does the stage 1 process usually take?",
    answer:
      "The stage 1 process typically takes minutes to complete. In this stage, household users can also get their rewards by scanning the QR code on the IoT Machine.",
  },
  {
    question: "How do I properly segregate food waste?",
    answer:
      "Segregation involves separating biodegradable from non-biodegradable materials. Use separate bins and follow local guidelines to ensure material can be processed efficiently.",
  },
  {
    question: "What food waste can be processed?",
    answer:
      "Most kitchen scraps and cooked food are acceptable. Avoid hazardous materials, oils in large quantity, and sharp objects. Check the machine's guidelines for specifics.",
  },
  {
    question: "How often should the machine be maintained?",
    answer:
      "Regular maintenance is encouraged monthly with professional servicing every 6-12 months depending on usage. Keep the machine clean and report any issues promptly.",
  },
  {
    question: "Is the system safe for households?",
    answer:
      "Yes. Machines are designed with safety sensors and enclosed processing. Always follow operational instructions and never insert hands while in use.",
  },
];

interface FAQItemProps {
  onSelectFAQ: (faq: string) => void;
  isChatMode?: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({ onSelectFAQ, isChatMode = false }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    if (isChatMode) {
      // In chat mode clicking should immediately send question
      onSelectFAQ(faqs[index].question);
      return;
    }

    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div
      className={`relative h-full px-4 sm:px-8 lg:px-20 py-8 sm:py-12 lg:py-16 overflow-hidden
        ${isChatMode ? "bg-[#f4f9f4]" : "bg-white"}`}
    >
      {/* TITLE */}
      <h3 className="text-[#7fa98a] font-semibold text-base sm:text-lg lg:text-xl mb-8 sm:mb-10">
        Frequently Asked Questions:
      </h3>

      {/* FAQ LIST */}
      <div className="space-y-3 sm:space-y-4 relative z-10">
        {faqs.map((f, i) => (
          <div key={i}>
            <button
              onClick={() => handleClick(i)}
              className={`w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-sm sm:text-base transition shadow
                ${isChatMode ? "bg-white text-[#4f7f63] hover:bg-[#eef5ef]" : "bg-[#94b59a] text-white hover:bg-[#7fa98a]"}`}
            >
              <span className="text-left">{f.question}</span>
              <span className="text-lg sm:text-xl">{expandedIndex === i ? "-" : ">"}</span>
            </button>

            {expandedIndex === i && (
              <div className="mt-3 bg-white p-3 rounded-md shadow-sm text-sm text-[#6C8770]">
                <p className="leading-relaxed">{f.answer}</p>

                {/* Ask Lili button - quickly start chat for this question */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => onSelectFAQ(f.question)}
                    className="bg-[#7fa98a] text-white px-3 py-2 rounded-full text-xs hover:bg-[#6d9277] transition"
                  >
                    Ask Lili
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CONTACT */}
      <p
        className={`text-xs sm:text-sm text-[#7fa98a]
          ${isChatMode ? "absolute bottom-4 sm:bottom-6 right-4 sm:right-8" : "mt-10 sm:mt-14 text-right"}`}
      >
        Contact us: {" "}
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
