// components/manager/StatsCards.jsx
import React from "react";

const StatsCards = ({ stats }) => {
  const statsConfig = [
    {
      label: "Total Tasks",
      value: stats.totalTasks,
      icon: "📋",
      color: "blue",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: "✅",
      color: "green",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: "⏳",
      color: "orange",
    },
    {
      label: "Assigned",
      value: stats.assigned,
      icon: "🔔",
      color: "red",
    },
    {
      label: "Active Team",
      value: stats.activeElectricians,
      icon: "👷",
      color: "purple",
    },
  ];

  return (
    <div className="stats-grid">
      {statsConfig.map((stat, index) => (
        <div key={index} className={`stat-box ${stat.color}`}>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-info">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
