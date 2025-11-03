import React from "react";

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
  return (
    <div className="flex items-center gap-5 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`
            px-9 py-4 rounded-full text-lg font-medium transition-all duration-200
            focus:outline-none
            ${
              activeTab === tab.id
                ? "bg-[#1f4529] text-white font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-b-2 hover:border-[#AFC8AD]/50"
            }
          `}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
