import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchAllowedModules } from '../services/moduleService';
import api from '../services/apiClient';
import "../types/Header.css";

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const normalized = await fetchAllowedModules(); // { list, get, has }
        if (!mounted) return;
        setModules(normalized);
      } catch (err) {
        console.error('modules/allowed error:', err);
        // leave modules empty so UI doesn't crash
        setModules({ list: [], get: () => undefined, has: () => false });
      }
    })();
    return () => { mounted = false; };
  }, []);

  const hasModule = (key: string | number) => {
    if (!modules) return false;
    if (typeof modules.has === 'function') return modules.has(key);
    return !!modules.list?.some((m: any) =>
      m.key === key || m.path === key || String(m.id) === String(key)
    );
  };

  // fallback: check localStorage user for role/modules
  const localUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const isAdminRole = localUser && (localUser.Roles === 1 || localUser.roleId === 1 || localUser.role === 'Admin');
  const hasModule6 = localUser && Array.isArray(localUser.user_modules) && localUser.user_modules.includes(6);

  const showAdmin = isAdminRole || hasModule6 || hasModule('admin') || hasModule(1);

  const links = allLinks.filter((l) => {
    if (l.to === '/admin') return showAdmin;
    return true;
  });

  return (
    <header className="header">
      <nav className="nav">
        <img
          src={new URL(
            "../assets/images/collection.png",
            import.meta.url
          ).href}
          alt="SIBOL"
          style={{ height: 28, width: "auto" }}
        />

        {/* Navigation Links */}
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

        {/* Right-side Icons */}
        <div className="nav-icons">
          <svg
            className="icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5a6 6 0 0 0-5-5.92V4a1 1 0 1 0-2 0v1.08A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2Z"
              fill="currentColor"
            />
          </svg>

          <svg
            className="icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </nav>
    </header>
  );
};

export default Header;
