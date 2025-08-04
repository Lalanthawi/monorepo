// components/TaskHistoryView.jsx
import React, { useEffect } from "react";

const TaskHistoryView = ({ taskHistory, onRefresh }) => {
  useEffect(() => {
    // Fetch history when component mounts
    onRefresh();
  }, []);

  const getCompletedTasks = () =>
    taskHistory.filter((t) => t.status === "Completed");
  const getThisMonthTasks = () => {
    const now = new Date();
    return taskHistory.filter((t) => {
      const taskDate = new Date(t.date);
      return (
        taskDate.getMonth() === now.getMonth() &&
        taskDate.getFullYear() === now.getFullYear() &&
        t.status === "Completed"
      );
    });
  };
  const getThisWeekTasks = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return taskHistory.filter((t) => {
      const taskDate = new Date(t.date);
      return taskDate >= weekAgo && t.status === "Completed";
    });
  };
  const getAverageRating = () => {
    const ratedTasks = taskHistory.filter((t) => t.rating > 0);
    if (ratedTasks.length === 0) return 0;
    return ratedTasks.reduce((sum, t) => sum + t.rating, 0) / ratedTasks.length;
  };
  const getTotalEarnings = () => {
    return taskHistory.reduce(
      (sum, task) => sum + (parseFloat(task.earnings) || 0),
      0
    );
  };

  return (
    <div className="history-section">
      <h2>Task History</h2>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <h3>{getCompletedTasks().length}</h3>
          <p>Total Completed</p>
        </div>
        <div className="stat-card">
          <h3>{getThisMonthTasks().length}</h3>
          <p>This Month</p>
        </div>
        <div className="stat-card">
          <h3>{getThisWeekTasks().length}</h3>
          <p>This Week</p>
        </div>
      </div>

      {/* History Table */}
      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Task ID</th>
              <th>Description</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {taskHistory.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  <div>
                    <p>No task history available</p>
                    <p>
                      <small>
                        Complete some tasks to see your history here
                      </small>
                    </p>
                    <button
                      onClick={onRefresh}
                      className="btn-primary"
                      style={{ marginTop: "1rem" }}
                    >
                      Refresh History
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              taskHistory.map((task) => (
                <tr key={task.id}>
                  <td>{new Date(task.date).toLocaleDateString()}</td>
                  <td>{task.id}</td>
                  <td>{task.title}</td>
                  <td>{task.customer}</td>
                  <td>
                    <span
                      className={`status-badge ${task.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TaskHistoryView;
