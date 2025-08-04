// components/manager/RecentTasks.jsx
import React from "react";

const RecentTasks = ({ tasks, onViewTask }) => {
  const recentTasks = tasks
    .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
    .slice(0, 5);

  return (
    <div className="dashboard-recent-tasks">
      <div className="recent-tasks-header">
        <h3>Recent Tasks</h3>
      </div>
      <div className="recent-tasks-container">
        {recentTasks.length === 0 ? (
          <div className="recent-tasks-empty">No recent tasks</div>
        ) : (
          recentTasks.map((task) => (
            <div
              key={task.id}
              className="recent-task-card"
              onClick={() => onViewTask(task)}
            >
              <div className="recent-task-top">
                <span className="recent-task-code">#{task.taskCode}</span>
                <span className={`recent-task-priority priority-${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </div>
              <div className="recent-task-title">{task.title}</div>
              <div className="recent-task-customer">
                {task.customerName} • {task.customerAddress}
              </div>
              <div className="recent-task-bottom">
                <span className={`recent-task-status status-${task.status.toLowerCase().replace(" ", "-")}`}>
                  {task.status}
                </span>
                <span className="recent-task-date">
                  Due: {new Date(task.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTasks;
