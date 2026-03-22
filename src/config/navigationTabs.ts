/**
 * Navigation-to-Tabs Mapping
 * Defines which tabs should appear in dropdown menus for each navigation item
 */

export interface Tab {
  id: string;
  label: string;
  icon: string;
}

export interface NavigationTabsConfig {
  [key: string]: Tab[];
}

const navigationTabs: NavigationTabsConfig = {
  household: [
    { id: "leaderboard", label: "Leaderboard", icon: "Trophy" },
    { id: "reward", label: "Rewards", icon: "Gift" },
    { id: "claimed", label: "Claimed Rewards", icon: "CheckCircle" },
  ],
  maintenance: [
    { id: "Request Maintenance", label: "Request", icon: "Plus" },
    { id: "Pending Maintenance", label: "Pending", icon: "Clock" },
    { id: "Complete Maintenance", label: "Completed", icon: "CheckCircle2" },
  ],
  "sibol-machines": [
    { id: "Machines", label: "Machines", icon: "Cpu" },
    { id: "Process Panel", label: "Process Panel", icon: "Sliders" },
    { id: "Waste Container", label: "Waste Container", icon: "Trash2" },
  ],
};

export default navigationTabs;
