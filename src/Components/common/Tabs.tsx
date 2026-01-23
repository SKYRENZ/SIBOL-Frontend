import React, { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const Tabs = ({ tabs, activeTab, onTabChange, className = "" }: TabsProps) => {
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

  // Find the active tab label for mobile view
  const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label || 'Menu';

  return (
    <div className={`relative ${className}`}>
      {/* Desktop Tabs */}
      <div className="hidden md:flex gap-2 overflow-x-auto py-1">
        {tabs.map((tab) => (
          <div key={tab.id} className="relative">
            <button
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-2 rounded-[20px] text-xs sm:text-sm font-medium transition-all duration-200 
                whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                border-2 ${activeTab === tab.id 
                  ? 'bg-[#2E523A] text-white border-transparent' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50'
                }
              `}
            >
              {tab.label}
            </button>
          </div>
        ))}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden relative w-full">
        <button
          ref={buttonRef}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors"
          type="button"
          aria-haspopup="menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="text-sm font-medium">{activeTabLabel}</span>
          <Menu className="w-5 h-5 ml-2 text-gray-500" />
        </button>

        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 z-10 w-full mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            style={{
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto'
            }}
          >
            <div className="py-1" role="none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm border-l-4 ${activeTab === tab.id
                    ? 'border-green-500 bg-green-50 text-green-900 font-medium' 
                    : 'border-transparent text-gray-700 hover:bg-gray-50'}`}
                  role="menuitem"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Default export for better compatibility with existing imports
export default Tabs;

// Keep named exports for type exports
export type { TabsProps };
