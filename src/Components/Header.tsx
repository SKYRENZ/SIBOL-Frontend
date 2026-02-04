import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { fetchAllowedModules } from '../services/moduleService';
import api from '../services/apiClient';
import "../tailwind.css";
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout as logoutAction } from '../store/slices/authSlice';

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
  const [notifications, setNotifications] = useState<Array<{id: number}>>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { isFirstLogin, user } = useAppSelector((state) => state.auth); // <- use Redux

  async function handleLogout() {
    try {
      dispatch(logoutAction());
      navigate('/login', { replace: true });
    } catch (err) {
      console.warn('logout failed', err);
      navigate('/login', { replace: true });
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [normalized, notificationsResponse] = await Promise.all([
          fetchAllowedModules(),
          // TODO: Replace with actual API call
          Promise.resolve({ data: [] })
        ]);
        if (!mounted) return;
        setModules(normalized);
        setNotifications(notificationsResponse.data);
      } catch (err) {
        console.error('Error loading data:', err);
        setModules({ list: [], get: () => undefined, has: () => false });
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const hasModule = (key: string | number) => {
    if (!modules) return false;
    if (typeof modules.has === 'function') return modules.has(key);
    return !!modules.list?.some((m: any) =>
      m.key === key || m.path === key || String(m.id) === String(key)
    );
  };

  const isAdminRole = (() => {
    if (!user) return false;
    const roleNum =
      (typeof user.Roles === 'number' ? user.Roles : undefined) ??
      (typeof user.roleId === 'number' ? user.roleId : undefined) ??
      (typeof user.role === 'number' ? user.role : undefined);
    const roleStr = typeof user.role === 'string' ? user.role : undefined;
    return roleNum === 1 || roleStr === 'Admin';
  })();

  const hasModule6 =
    user && Array.isArray(user.user_modules) && user.user_modules.includes(6);

  const showAdmin = isAdminRole || hasModule6 || hasModule('admin') || hasModule(1);

  const links = allLinks.filter((l) => {
    if (l.to === '/admin') return showAdmin;
    return true;
  });

  return (
    <header className={`header ${isFirstLogin ? 'pointer-events-none opacity-50' : ''}`}>
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
          aria-controls="primary-navigation"
          aria-label="Toggle navigation menu"
          disabled={isFirstLogin}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-menu ${menuOpen ? "open" : ""}`} id="primary-navigation">
          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  style={{ pointerEvents: isFirstLogin ? 'none' : 'auto' }}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* RIGHT ICONS */}
          <div className="nav-icons">
            {/* Notifications */}
            <NavLink
              to="/notifications"
              title="Notifications"
              aria-label="Notifications"
              className={({ isActive }) =>
                `icon-btn ${isActive ? "active-icon" : ""}`
              }
              style={{ pointerEvents: isFirstLogin ? 'none' : 'auto' }}
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

            {/* ✅ PROFILE ICON → /profile */}
            <NavLink
              to="/profile"
              title="Profile"
              aria-label="Profile"
              className={({ isActive }) =>
                `icon-btn ${isActive ? "active-icon" : ""}`
              }
              style={{ pointerEvents: isFirstLogin ? 'none' : 'auto' }}
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
            </NavLink>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="logout-btn"
              disabled={isFirstLogin}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 8px',
                marginLeft: 8,
                cursor: isFirstLogin ? 'not-allowed' : 'pointer',
                color: 'inherit',
                fontSize: 14,
                opacity: isFirstLogin ? 0.5 : 1,
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
