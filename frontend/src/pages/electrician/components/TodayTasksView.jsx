// components/TodayTasksView.jsx
import React from "react";
import StatsOverview from "./StatsOverview";
import TaskCard from "./TaskCard";

const TodayTasksView = ({
  stats,
  todayTasks,
  onStartTask,
  onCompleteTask,
  onViewDetails,
  onReportIssue,
  loading,
  error,
  onRetry,
}) => {
  const getTasksByStatus = (status) => {
    if (status === "Pending") {
      return todayTasks.filter(
        (task) => task.status === "Pending" || task.status === "Assigned"
      );
    }
    return todayTasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <StatsOverview stats={stats} />

      <div className="task-categories">
        {/* Pending Tasks */}
        <div className="task-category">
          <h3>🔔 Pending Tasks ({getTasksByStatus("Pending").length})</h3>
          <div className="task-list">
            {getTasksByStatus("Pending").length === 0 ? (
              <div className="no-tasks">
                <p>No pending tasks</p>
                <small>
                  Tasks with status "Pending" or "Assigned" will appear here
                </small>
              </div>
            ) : (
              getTasksByStatus("Pending").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStartTask={onStartTask}
                  onViewDetails={onViewDetails}
                />
              ))
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="task-category">
          <h3>⚡ In Progress ({getTasksByStatus("In Progress").length})</h3>
          <div className="task-list">
            {getTasksByStatus("In Progress").length === 0 ? (
              <div className="no-tasks">
                <p>No tasks in progress</p>
                <small>Tasks with status "In Progress" will appear here</small>
              </div>
            ) : (
              getTasksByStatus("In Progress").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onCompleteTask={onCompleteTask}
                  onReportIssue={onReportIssue}
                />
              ))
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="task-category">
          <h3>✅ Completed Today ({getTasksByStatus("Completed").length})</h3>
          <div className="task-list">
            {getTasksByStatus("Completed").length === 0 ? (
              <div className="no-tasks">
                <p>No completed tasks today</p>
                <small>Tasks with status "Completed" will appear here</small>
              </div>
            ) : (
              getTasksByStatus("Completed").map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TodayTasksView;
