import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { fetchAllowedModules } from "../services/moduleService";
import "../tailwind.css";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout as logoutAction } from "../store/slices/authSlice";
import ConfirmationModal from "./common/ConfirmationModal";

const allLinks = [
  { id: 1, to: "/dashboard", label: "Dashboard" },
  { id: 2, to: "/sibol-machines", label: "SIBOL Machines" },
  { id: 3, to: "/maintenance", label: "Maintenance" },
  { id: 4, to: "/household", label: "Household" },
  { id: 5, to: "/chat-support", label: "Chat Support" },
  { id: 6, to: "/admin", label: "Admin" },
];

const Header: React.FC = () => {
  const [modules, setModules] = useState<any>({ list: [], has: () => false });
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number }>>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { isFirstLogin, user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  };

  /* ---------------- effects ---------------- */

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [normalized, notificationsResponse] = await Promise.all([
          fetchAllowedModules(),
          Promise.resolve({ data: [] }),
        ]);
        if (!mounted) return;
        setModules(normalized);
        setNotifications(notificationsResponse.data);
      } catch (err) {
        console.error("Error loading data:", err);
        setModules({ list: [], has: () => false });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  /* ---------------- role logic ---------------- */

  const hasModule = (key: string | number) => {
    if (!modules) return false;
    if (typeof modules.has === "function") return modules.has(key);
    return !!modules.list?.some(
      (m: any) =>
        m.key === key || m.path === key || String(m.id) === String(key)
    );
  };

  const isAdminRole = (() => {
    if (!user) return false;
    const roleNum =
      (typeof user.Roles === "number" ? user.Roles : undefined) ??
      (typeof user.roleId === "number" ? user.roleId : undefined) ??
      (typeof user.role === "number" ? user.role : undefined);
    const roleStr = typeof user.role === "string" ? user.role : undefined;
    return roleNum === 1 || roleStr === "Admin";
  })();

  const hasModule6 =
    user && Array.isArray(user.user_modules) && user.user_modules.includes(6);

  const showAdmin = isAdminRole || hasModule6 || hasModule("admin") || hasModule(1);

  const links = allLinks.filter((l) => {
    if (l.to === "/admin") return showAdmin;
    return true;
  });

  /* ---------------- render ---------------- */

  return (
    <header className={`header ${isFirstLogin ? "pointer-events-none opacity-50" : ""}`}>
      <nav className="nav">
        <img
          className="nav-logo"
          src={new URL("../assets/images/collection.png", import.meta.url).href}
          alt="SIBOL"
        />

        <button
          type="button"
          className="menu-toggle"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          disabled={isFirstLogin}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* RIGHT ICONS */}
          <div className="nav-icons">
            {/* Notifications (UNCHANGED) */}
            <NavLink
              to="/notifications"
              title="Notifications"
              aria-label="Notifications"
              className={({ isActive }) =>
                `icon-btn ${isActive ? "active-icon" : ""}`
              }
            >
              <svg
                className="icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5a6 6 0 0 0-5-5.92V4a1 1 0 1 0-2 0v1.08A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2Z"
                  fill="currentColor"
                />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </NavLink>

            {/* PROFILE ICON + DROPDOWN (ICON UNCHANGED) */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                title="Profile"
                aria-label="Profile"
                className="icon-btn"
                onClick={() => setProfileOpen((p) => !p)}
              >
                <svg
                  className="icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              {profileOpen && (
                <div
                  className="
                    absolute right-0 mt-3 w-44
                    rounded-xl bg-white
                    shadow-[0_10px_25px_rgba(0,0,0,0.12)]
                    border border-gray-100
                    z-50
                    overflow-hidden
                  "
                >
                  <NavLink
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="
                    flex items-center gap-2
                    px-4 py-3
                    text-sm
                    text-gray-700
                    hover:bg-green-50
                    hover:text-green-700
                    transition
                  "
                >
                  Profile
                </NavLink>
                  <div className="h-px bg-gray-100" />

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="
                      w-full text-left
                      px-4 py-3
                      text-sm text-red-600
                      hover:bg-red-50
                      transition
                    "
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* LOGOUT CONFIRMATION MODAL */}
    {/* ---------------- LOGOUT CONFIRMATION MODAL ---------------- */}
<ConfirmationModal
  isOpen={showLogoutConfirm}
  onClose={() => setShowLogoutConfirm(false)}
  onConfirm={async () => handleLogout()}
  title="Confirm Logout"
  description="Are you sure you want to log out?"
  confirmText="Logout"
  cancelText="Cancel"
  variant="danger"
>
  
</ConfirmationModal>

    </header>
  );
};

export default Header;
