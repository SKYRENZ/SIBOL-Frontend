import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../tailwind.css";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout as logoutAction } from "../store/slices/authSlice";
import ConfirmationModal from "./common/ConfirmationModal";
import NotificationsModal from "./common/NotificationsModal";
import ProfileModal from "./common/ProfileModal";
import {
  CircleQuestionMark,
  Trophy,
  Gift,
  CheckCircle,
  Plus,
  Clock,
  CheckCircle2,
  Cpu,
  Sliders,
  Trash2,
} from "lucide-react";
import navigationTabs from "../config/navigationTabs";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
  type NotificationType,
} from "../services/notificationService";

// Icon mapping
const iconMap: { [key: string]: React.ComponentType<{ size: number; className: string }> } = {
  Trophy,
  Gift,
  CheckCircle,
  Plus,
  Clock,
  CheckCircle2,
  Cpu,
  Sliders,
  Trash2,
};

const allLinks = [
  { id: 1, to: "/dashboard", label: "Dashboard" },
  { id: 2, to: "/sibol-machines", label: "SIBOL Machines" },
  { id: 3, to: "/maintenance", label: "Maintenance" },
  { id: 4, to: "/household", label: "Household" },
  { id: 5, to: "/chat-support", label: "Chat Support" },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | NotificationType>("all");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // <-- added
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState<number | null>(null);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { isFirstLogin, user, isAuthenticated, hasCheckedAuth, isCheckingAuth } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  };

  /* ---------------- effects ---------------- */

  useEffect(() => {
    if (!hasCheckedAuth || isCheckingAuth || !isAuthenticated || !user) return;

    let mounted = true;
    (async () => {
      try {
        const unreadRows = await getNotifications({ unreadOnly: true, limit: 200 });
        if (!mounted) return;
        setUnreadCount(unreadRows.length);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    })();

    return () => { mounted = false; };
  }, [hasCheckedAuth, isCheckingAuth, isAuthenticated, user]);

  useEffect(() => {
    if (!hasCheckedAuth || isCheckingAuth || !isAuthenticated || !user) return;
    let mounted = true;

    const refreshUnread = async () => {
      try {
        const unreadRows = await getNotifications({ unreadOnly: true, limit: 200 });
        if (!mounted) return;
        setUnreadCount(unreadRows.length);
      } catch {
        // ignore
      }
    };

    refreshUnread();
    const id = window.setInterval(refreshUnread, 20000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [hasCheckedAuth, isCheckingAuth, isAuthenticated, user]);

  useEffect(() => {
    setMenuOpen(false);
    setProfileDropdownOpen(false); // <-- replaced
  }, [location.pathname]);

  useEffect(() => {
    if (!notificationsOpen || !isAuthenticated) return;
    let mounted = true;
    (async () => {
      setNotificationsLoading(true);
      try {
        const rows = await getNotifications({
          type: selectedFilter,
          limit: 200,
        });
        if (!mounted) return;
        setNotifications(rows);
      } catch {
        if (!mounted) return;
        setNotifications([]);
      } finally {
        if (!mounted) return;
        setNotificationsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [notificationsOpen, selectedFilter, isAuthenticated]);

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
        setProfileDropdownOpen(false); // <-- replaced
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // close nav dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setHoveredNavItem(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const openNotifications = () => setNotificationsOpen(true);
  const closeNotifications = () => setNotificationsOpen(false);

  const links = allLinks;

  /* ---------------- render ---------------- */

  return (
    <header className={`header ${isFirstLogin ? "pointer-events-none opacity-50" : ""}`}>
      <nav className="nav">
        {user?.Barangay_Name && (
          <span className="text-xl font-bold text-white whitespace-nowrap tracking-wide mr-4">{user.Barangay_Name}</span>
        )}
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
          <div className="nav-links-wrapper" ref={dropdownRef}>
            <ul className="nav-links">
              {links.map((link) => {
                // Get the config key for this navigation item
                const configKey =
                  link.to === "/household"
                    ? "household"
                    : link.to === "/maintenance"
                      ? "maintenance"
                      : link.to === "/sibol-machines"
                        ? "sibol-machines"
                        : null;

                const hasDropdown = configKey && navigationTabs[configKey];

                return (
                  <li
                    key={link.to}
                    onMouseEnter={() => hasDropdown && setHoveredNavItem(link.id)}
                    onMouseLeave={() => hasDropdown && setHoveredNavItem(null)}
                    className="relative group"
                  >
                    <NavLink
                      to={link.to}
                      state={location.pathname === link.to ? { activeTab: location.state?.activeTab } : undefined}
                      className={({ isActive }) =>
                        `nav-link text-sm lg:text-base ${isActive ? "active" : ""} ${
                          link.to === "/dashboard" ? "tour-dashboard" : ""
                        } ${
                          link.to === "/sibol-machines" ? "tour-sibol" : ""
                        } ${
                          link.to === "/maintenance" ? "tour-maintenance" : ""
                        } ${
                          link.to === "/household" ? "tour-household" : ""
                        } ${
                          link.to === "/chat-support" ? "tour-chat" : ""
                        } ${
                          link.to === "/admin" ? "tour-admin" : ""
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>

                    {/* DROPDOWN MENU - only show on desktop and when hovered */}
                    {hasDropdown && hoveredNavItem === link.id && (
                      <div className="nav-dropdown">
                        {navigationTabs[configKey!]?.map((tab) => {
                          const isActive = location.state?.activeTab === tab.id;
                          const IconComponent = iconMap[tab.icon];
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                navigate(link.to, { state: { activeTab: tab.id } });
                                setHoveredNavItem(null);
                                setMenuOpen(false);
                              }}
                              className={`nav-dropdown-item ${isActive ? "nav-dropdown-item-active" : ""}`}
                            >
                              {IconComponent && (
                                <IconComponent size={16} className="nav-dropdown-icon" />
                              )}
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT ICONS */}
          <div className="nav-icons">

            {/* TOUR GUIDE */}
          <button
            type="button"
            title="Website Tour"
            aria-label="Start Website Tour"
            className="icon-btn tour-trigger"
            onClick={() => window.dispatchEvent(new Event("start-tour"))}
          >
            <CircleQuestionMark className="icon" size={20} />
          </button>

            {/* Notifications */}
            <button
              type="button"
              title="Notifications"
              aria-label="Notifications"
              className="icon-btn relative tour-notification"
              onClick={openNotifications}
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
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* PROFILE ICON + DROPDOWN */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                title="Profile"
                aria-label="Profile"
                className="icon-btn tour-profile"
                onClick={() => setProfileDropdownOpen((prev) => !prev)} // toggle dropdown
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

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-44 rounded-xl bg-white shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setProfileModalOpen(true); // open modal
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                  >
                    Profile
                  </button>

                  <div className="h-px bg-gray-100" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={closeNotifications}
        notifications={notifications}
        loading={notificationsLoading}
        selectedFilter={selectedFilter}
        onFilterChange={(value) => setSelectedFilter(value)}
        onMarkRead={async (id, type) => {
          try {
            await markNotificationRead(id, type);
            setNotifications((prev) => {
              const wasUnread = prev.find((n) => n.id === id)?.read === false;
              if (wasUnread) {
                setUnreadCount((count) => Math.max(0, count - 1));
              }
              return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
            });
          } catch {
            // ignore
          }
        }}
        onMarkAllRead={async () => {
          try {
            if (selectedFilter === "all") {
              await Promise.all([
                markAllNotificationsRead("maintenance"),
                markAllNotificationsRead("waste-input"),
                markAllNotificationsRead("collection"),
                markAllNotificationsRead("system"),
              ]);
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              setUnreadCount(0);
            } else {
              const unreadInFilter = notifications.filter((n) => !n.read).length;
              await markAllNotificationsRead(selectedFilter);
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              setUnreadCount((prev) => Math.max(0, prev - unreadInFilter));
            }
          } catch {
            // ignore
          }
        }}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* LOGOUT CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => handleLogout()}
        title="Confirm Logout"
        description="Are you sure you want to log out?"
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
      />
    </header>
  );
};

export default Header;
