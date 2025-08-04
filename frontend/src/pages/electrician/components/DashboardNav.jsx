// components/DashboardNav.jsx
import React from "react";

const DashboardNav = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: "today", label: "📅 Today's Tasks" },
    { id: "history", label: "📊 Task History" },
    { id: "profile", label: "👤 My Profile" },
  ];

  return (
    <nav className="dashboard-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${activeView === item.id ? "active" : ""}`}
          onClick={() => onViewChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default DashboardNav;
