/**
 * Navigation-to-Tabs Mapping
 * Defines which tabs should appear in dropdown menus for each navigation item
 */

export interface Tab {
  id: string;
  label: string;
}

export interface NavigationTabsConfig {
  [key: string]: Tab[];
}

const navigationTabs: NavigationTabsConfig = {
  household: [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "reward", label: "Rewards" },
    { id: "claimed", label: "Claimed Rewards" },
  ],
  maintenance: [
    { id: "Request Maintenance", label: "Request Maintenance" },
    { id: "Pending Maintenance", label: "Pending Maintenance" },
    { id: "Complete Maintenance", label: "Complete Maintenance" },
  ],
  "sibol-machines": [
    { id: "Machines", label: "Machines" },
    { id: "Process Panel", label: "Process Panel" },
    { id: "Waste Container", label: "Waste Container" },
  ],
};

export default navigationTabs;
