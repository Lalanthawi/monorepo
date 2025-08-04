// components/DashboardHeader.jsx
import React from "react";

const DashboardHeader = ({
  userInfo,
  notifications,
  onNotificationClick,
  onLogout,
}) => {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>Electrician Dashboard</h1>
        <p>Welcome back, {userInfo.name || "Electrician"}</p>
      </div>
      <div className="header-right">
        <button className="notification-btn" onClick={onNotificationClick}>
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
