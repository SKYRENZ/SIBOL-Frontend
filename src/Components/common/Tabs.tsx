import React, { useState, useRef, useEffect } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [mobileMenuOpen]);

  return (
    <div className="relative">
      {/* Desktop tabs - hidden on mobile/tablet */}
      <div className="hidden md:flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 rounded-[20px] text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap focus:outline-none
              ${
                activeTab === tab.id
                  ? "bg-[#2E523A] text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile hamburger menu - visible only on mobile/tablet */}
      <div className="md:hidden flex items-center relative">
        <button
          ref={buttonRef}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="
            p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 focus:outline-none
          "
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Mobile dropdown menu - positioned absolute relative to parent */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-2xl z-[9999] min-w-[180px] border border-gray-200 origin-top-left"
            style={{
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto'
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 text-xs font-medium transition-all duration-200 first:rounded-t-lg last:rounded-b-lg focus:outline-none
                  ${
                    activeTab === tab.id
                      ? "bg-[#2E523A] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;
