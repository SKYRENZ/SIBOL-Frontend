import { useState, useRef, useEffect } from "react";
import { Filter } from "lucide-react";

interface FilterDropdownProps {
  onSelect: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(""); // default: Filter by
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = ["All", "Collecting", "Pending", "Collected", "Cancelled"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
    onSelect(value);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-[#355842]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-[#7B9B7B] rounded-md h-9 px-4 flex items-center justify-between gap-2 min-w-[150px] text-sm font-medium bg-transparent"
      >
        <span>{selected || "Filter by"}</span>
        <Filter className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full min-w-[150px] bg-white border border-[#7B9B7B] rounded-md shadow-sm z-20">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(item)}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-[#e8f0e8]"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
