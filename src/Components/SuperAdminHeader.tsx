import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../tailwind.css";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout as logoutAction } from "../store/slices/authSlice";
import ConfirmationModal from "./common/ConfirmationModal";
import NotificationsModal from "./common/NotificationsModal";
import ProfileModal from "./common/ProfileModal";
import {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    type NotificationItem,
    type NotificationType,
} from "../services/notificationService";

/**
 * Simplified header for the SuperAdmin page.
 * Shows: Logo + Notification bell + Profile dropdown.
 * No navigation links.
 */
const SuperAdminHeader: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<"all" | NotificationType>("all");
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const profileRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const { isFirstLogin, user, isAuthenticated, hasCheckedAuth, isCheckingAuth } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutAction());
        navigate("/login", { replace: true });
    };

    /* ---------------- effects ---------------- */

    // Load initial unread count
    useEffect(() => {
        if (!hasCheckedAuth || isCheckingAuth || !isAuthenticated || !user) return;

        let mounted = true;
        (async () => {
            try {
                const unreadRows = await getNotifications({ unreadOnly: true, limit: 200 });
                if (!mounted) return;
                setUnreadCount(unreadRows.length);
            } catch (err) {
                console.error("Error loading notifications:", err);
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

    const openNotifications = () => setNotificationsOpen(true);
    const closeNotifications = () => setNotificationsOpen(false);

    /* ---------------- render ---------------- */

    return (
        <header className={`header ${isFirstLogin ? "pointer-events-none opacity-50" : ""}`}>
            <nav className="nav">
                {/* Logo */}
                <img
                    className="nav-logo"
                    src={new URL("../assets/images/collection.png", import.meta.url).href}
                    alt="SIBOL"
                />

                {/* Right side icons only — no nav links */}
                <div className="nav-menu">
                    <div className="nav-icons" style={{ marginLeft: "auto" }}>
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
