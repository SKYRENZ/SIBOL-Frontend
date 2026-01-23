import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import "../tailwind.css";
import ActivitySummary from "../Components/Profile/ActivitySummary"
import SecuritySetting from "../Components/Profile/SecuritySetting"
import ProfileInformation from "../Components/Profile/ProfileInformation"


const SECTIONS = [
  {
    id: "Profile Information",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6Z" />
      </svg>
    ),
  },
  {
    id: "Activity Summary",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h4v8H3v-8Zm7-6h4v14h-4V7Zm7-4h4v18h-4V3Z" />
      </svg>
    ),
  },
  {
    id: "Security Setting",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1 3 5v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V5l-9-4Z" />
      </svg>
    ),
  },
];

// =============================
// PROFILE PAGE
// =============================
const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] =
    useState<string>("Profile Information");

  const [headerHeight, setHeaderHeight] = useState<number>(0);

  // Header height spacer (matches your header behavior)
  useEffect(() => {
    const update = () => {
      const headerEl = document.querySelector(
        "header.header"
      ) as HTMLElement | null;

      if (!headerEl) {
        setHeaderHeight(0);
        return;
      }

      const style = getComputedStyle(headerEl);
      const isFixed =
        style.position === "fixed" || style.position === "sticky";

      setHeaderHeight(
        isFixed ? Math.ceil(headerEl.getBoundingClientRect().height) : 0
      );
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header spacer */}
      <div style={{ height: headerHeight }} aria-hidden />

      <div className="w-full px-6 py-8">
        <div className="mx-auto max-w-screen-2xl">
          <h1 className="mb-6 text-2xl font-bold text-[#1c3c2d]">
            Profile Overview
          </h1>

          <div className="grid gap-8 md:grid-cols-[72px_1fr]">
            {/* Sidebar */}
            <aside className="flex flex-row gap-4 md:flex-col">
              {SECTIONS.map(({ id, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  title={id}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition shadow-sm ${
                    activeSection === id
                      ? "bg-[#2E523A] text-white"
                      : "bg-[#f3f4f1] text-[#2E523A] hover:bg-[#e6ebe7]"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </aside>

            {/* Content */}
            <section>
              {/* Profile Information */}
              {activeSection === "Profile Information" && (
                <ProfileInformation />
              )}
              
              {/* Activity Summary */}
              {activeSection === "Activity Summary" && (
                <ActivitySummary />
              )}

              {/* Security Setting */}
              {activeSection === "Security Setting" && (
                <SecuritySetting />
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
