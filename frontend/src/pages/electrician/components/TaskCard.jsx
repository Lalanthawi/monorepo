// components/TaskCard.jsx
import React from "react";

const TaskCard = ({
  task,
  onStartTask,
  onCompleteTask,
  onViewDetails,
  onReportIssue,
}) => {
  const getStatusClass = (status) => {
    return status.toLowerCase().replace(" ", "-");
  };

  const renderActions = () => {
    switch (task.status) {
      case "Pending":
      case "Assigned":
        return (
          <>
            <button className="btn-start" onClick={() => onStartTask(task)}>
              Start Task
            </button>
            <button className="btn-details" onClick={() => onViewDetails(task)}>
              View Details
            </button>
          </>
        );

      case "In Progress":
        return (
          <>
            <button
              className="btn-complete"
              onClick={() => onCompleteTask(task)}
            >
              Complete Task
            </button>
            <button className="btn-issue" onClick={() => onReportIssue(task)}>
              Report Issue
            </button>
          </>
        );

      case "Completed":
        return (
          <>
            {task.rating && (
              <div className="task-rating">
                <span>Rating: {"⭐".repeat(task.rating)}</span>
                {task.feedback && <p className="feedback">"{task.feedback}"</p>}
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`task-card ${getStatusClass(task.status)}`}>
      <div className="task-header">
        <span className="task-id">{task.id}</span>
        {task.status === "Pending" || task.status === "Assigned" ? (
          <span className={`priority ${task.priority.toLowerCase()}`}>
            {task.priority} Priority
          </span>
        ) : (
          <span className={`status-badge ${getStatusClass(task.status)}`}>
            {task.status}
          </span>
        )}
      </div>

      <h4>{task.title}</h4>
      <p className="customer-info">
        <strong>{task.customer}</strong>
        <br />
        📍 {task.address}
        {(task.status === "Pending" || task.status === "Assigned") && (
          <>
            <br />
            📞 {task.phone}
          </>
        )}
      </p>

      <div className="task-time">
        {task.status === "Pending" || task.status === "Assigned" ? (
          <>
            <span>🕐 {task.scheduledTime}</span>
            <span>⏱️ {task.estimatedHours} hours</span>
          </>
        ) : task.status === "In Progress" ? (
          <span>🕐 Started: {task.startTime || "Just now"}</span>
        ) : task.status === "Completed" ? (
          <span>✅ Completed: {task.completedTime || "Today"}</span>
        ) : null}
      </div>

      <div className="task-actions">{renderActions()}</div>
    </div>
  );
};

export default TaskCard;
