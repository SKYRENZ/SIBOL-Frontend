import React from "react";
import "../types/Header.css";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/sibol-machines", label: "SIBOL Machines" },
    { to: "/maintenance", label: "Maintenance" },
    { to: "/household", label: "Household" },
    { to: "/chat-support", label: "Chat Support" },
  ];

  return (
    <header className="header">
      <nav className="nav">
        <img
          src={new URL("../assets/images/SIBOLWORDLOGO.png", import.meta.url).href}
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
                  isActive ? "nav-link active" : "nav-link"
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
