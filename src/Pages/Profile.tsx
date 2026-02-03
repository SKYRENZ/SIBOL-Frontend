import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import "../tailwind.css";
import ProfileInformation from "../Components/Profile/ProfileInformation"


// =============================
// PROFILE PAGE
// =============================
const ProfilePage: React.FC = () => {
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

      <div className="w-full px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-2xl bg-[#cdddc9] p-8">
          <div>
            {/* Content */}
            <section>
              <ProfileInformation />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
