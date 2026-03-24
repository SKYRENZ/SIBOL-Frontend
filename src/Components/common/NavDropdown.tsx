import React from "react";
import { useLocation } from "react-router-dom";

export interface NavDropdownItem {
  id: string;
  label: string;
  icon?: string;
}

export interface NavDropdownProps {
  items: NavDropdownItem[];
  currentPath: string;
  onSelect: (item: NavDropdownItem) => void;
  iconMap?: { [key: string]: React.ComponentType<{ size: number; className: string }> };
  isHovered: boolean;
  activeTabId?: string; // Optional: if provided, use this to determine active state. Otherwise detect from URL
}

/**
 * Reusable NavDropdown component for navigation menus
 * Matches the styling of Header.tsx dropdowns using nav-dropdown and nav-dropdown-item classes
 *
 * Supports two modes:
 * 1. Query parameter mode: activeTabId is auto-detected from ?tab=... URL
 * 2. State-based mode: activeTabId can be passed as prop (for location.state-based routing)
 */
const NavDropdown: React.FC<NavDropdownProps> = ({
  items,
  currentPath,
  onSelect,
  iconMap = {},
  isHovered,
  activeTabId,
}) => {
  const location = useLocation();

  if (!isHovered) {
    return null;
  }

  return (
    <div className="nav-dropdown">
      {items.map((item) => {
        // Determine active state: either from prop or from URL query parameter
        let isActive = false;

        if (activeTabId !== undefined) {
          // Use provided activeTabId prop
          isActive = location.pathname === currentPath && activeTabId === item.id;
        } else {
          // Fall back to query parameter detection
          const tabParam = new URLSearchParams(location.search).get("tab");
          isActive = location.pathname === currentPath && tabParam === item.id;
        }

        const IconComponent = iconMap[item.icon || ""];

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`nav-dropdown-item ${isActive ? "nav-dropdown-item-active" : ""}`}
          >
            {IconComponent && (
              <IconComponent size={16} className="nav-dropdown-icon" />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavDropdown;
