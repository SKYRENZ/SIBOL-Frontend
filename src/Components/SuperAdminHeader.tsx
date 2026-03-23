import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { fetchAllowedModules } from "../services/moduleService";
import "../tailwind.css";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout as logoutAction } from "../store/slices/authSlice";
import ConfirmationModal from "./common/ConfirmationModal";
import NotificationsModal from "./common/NotificationsModal";
import ProfileModal from "./common/ProfileModal";
import NavDropdown from "./common/NavDropdown";
import navigationTabs from "../config/navigationTabs";
import {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    type NotificationItem,
    type NotificationType,
} from "../services/notificationService";
import {
    CheckCircle,
    CheckCircle2,
    ListTodo,
} from "lucide-react";

// Icon mapping
const iconMap: { [key: string]: React.ComponentType<{ size: number; className: string }> } = {
    CheckCircle,
    CheckCircle2,
    ListTodo,
};

const allLinks = [
    { id: 1, to: "/superadmin-dashboard", label: "Dashboard" },
    { id: 2, to: "/superadmin", label: "User Management" },
    { id: 3, to: "/point-system", label: "Point System", adminOnly: true },
];

/**
 * Header for the SuperAdmin page.
 * Shows: Logo + Dashboard / Admin nav links + Notification bell + Profile dropdown.
 */
const SuperAdminHeader: React.FC = () => {
    const [modules, setModules] = useState<any>({ list: [], has: () => false });
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<"all" | NotificationType>("all");
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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
                const [normalized, unreadRows] = await Promise.all([
                    fetchAllowedModules(),
                    getNotifications({ unreadOnly: true, limit: 200 }),
                ]);
                if (!mounted) return;
                setModules(normalized);
                setUnreadCount(unreadRows.length);
            } catch (err) {
                console.error("Error loading data:", err);
                setModules({ list: [], has: () => false });
            }
        })();

        return () => { mounted = false; };
    }, [hasCheckedAuth, isCheckingAuth, isAuthenticated, user]);

    // Poll unread count
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

    // Close dropdowns on route change
    useEffect(() => {
        setMenuOpen(false);
        setProfileDropdownOpen(false);
    }, [location.pathname]);

    // Load notifications when modal opens
    useEffect(() => {
        if (!notificationsOpen || !isAuthenticated) return;
        let mounted = true;
        (async () => {
            setNotificationsLoading(true);
            try {
                const rows = await getNotifications({ type: selectedFilter, limit: 200 });
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

        return () => { mounted = false; };
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

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close nav dropdown on outside click
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

    /* ---------------- role logic ---------------- */

    const hasModule = (key: string | number) => {
        if (!modules) return false;
        if (typeof modules.has === "function") return modules.has(key);
        return !!modules.list?.some(
            (m: any) =>
                m.key === key || m.path === key || String(m.id) === String(key)
        );
    };

    const isSuperAdminRole = (() => {
        if (!user) return false;
        const roleNum =
            (typeof user.Roles === "number" ? user.Roles : undefined) ??
            (typeof user.roleId === "number" ? user.roleId : undefined) ??
            (typeof user.role === "number" ? user.role : undefined);
        const roleStr = typeof user.role === "string" ? user.role : undefined;
        return roleNum === 5 || roleStr === "SuperAdmin";
    })();

    const isAdminRole = (() => {
        if (!user) return false;
        const roleNum =
            (typeof user.Roles === "number" ? user.Roles : undefined) ??
            (typeof user.roleId === "number" ? user.roleId : undefined) ??
            (typeof user.role === "number" ? user.role : undefined);
        const roleStr = typeof user.role === "string" ? user.role : undefined;
        return roleNum === 1 || roleStr === "Admin";
    })();

    const links = allLinks
        .map((l) => {
            if (l.label === "Dashboard") {
                return { ...l, to: isSuperAdminRole ? "/superadmin-dashboard" : "/admin-dashboard" };
            }
            if (l.label === "User Management") {
                return { ...l, to: isSuperAdminRole ? "/superadmin" : "/admin" };
            }
            return l;
        })
        .filter((l: any) => {
            if (l.label === "User Management") return isSuperAdminRole || isAdminRole;
            if (l.adminOnly) return isAdminRole;
            return true;
        });

    /* ---------------- render ---------------- */

    return (
        <header className={`header ${isFirstLogin ? "pointer-events-none opacity-50" : ""}`}>
            <nav className="nav">
                {/* Barangay label */}
                {user?.Barangay_Name && (
                    <span className="text-xl font-bold text-white whitespace-nowrap tracking-wide mr-4">{user.Barangay_Name}</span>
                )}
                {/* Logo */}
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
                                // Check if this link has a dropdown configuration
                                const hasDropdown = link.label === "User Management" && navigationTabs["admin"];

                                return (
                                    <li
                                        key={link.to}
                                        onMouseEnter={() => hasDropdown && setHoveredNavItem(link.id)}
                                        onMouseLeave={() => hasDropdown && setHoveredNavItem(null)}
                                        className="relative group"
                                    >
                                        <NavLink
                                            to={link.to}
                                            className={({ isActive }) =>
                                                `nav-link ${isActive ? "active" : ""}`
                                            }
                                        >
                                            {link.label}
                                        </NavLink>

                                        {/* DROPDOWN MENU - only show on desktop and when hovered */}
                                        <NavDropdown
                                            items={navigationTabs["admin"] || []}
                                            currentPath={link.to}
                                            isHovered={Boolean(hasDropdown && hoveredNavItem === link.id)}
                                            iconMap={iconMap}
                                            onSelect={(item) => {
                                                navigate(`${link.to}?tab=${item.id}`);
                                                setHoveredNavItem(null);
                                                setMenuOpen(false);
                                            }}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* RIGHT ICONS */}
                    <div className="nav-icons">
                        {/* Notifications */}
                        <button
                            type="button"
                            title="Notifications"
                            aria-label="Notifications"
                            className="icon-btn relative"
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

                        {/* Profile icon + dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                title="Profile"
                                aria-label="Profile"
                                className="icon-btn"
                                onClick={() => setProfileDropdownOpen((prev) => !prev)}
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
                                            setProfileModalOpen(true);
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

export default SuperAdminHeader;
