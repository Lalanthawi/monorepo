// components/StatsOverview.jsx
import React from "react";

const StatsOverview = ({ stats }) => {
  const getProgressPercentage = () => {
    const total = stats.todayTasks;
    const completed = stats.completedToday;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="overview-section">
      <h2>Today's Overview</h2>
      <div className="date-display">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span>Daily Progress</span>
          <span>
            {stats.completedToday} of {stats.todayTasks} tasks completed
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-box">
          <div className="stat-value">{stats.todayTasks}</div>
          <div className="stat-label">Today's Tasks</div>
        </div>
        <div className="stat-box success">
          <div className="stat-value">{stats.completedToday}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-box warning">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-box info">
          <div className="stat-value">{stats.pendingToday}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
