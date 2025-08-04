// components/manager/TaskManagementView.jsx
import React from "react";

const TaskManagementView = ({
  tasks,
  filteredTasks,
  activeFilter,
  onFilterChange,
  onCreateTask,
  onAssignTask,
  onViewTask,
  onEditTask,
  onDeleteTask,
}) => {
  const filters = [
    { id: "all", label: "All Tasks" },
    { id: "pending", label: "Pending" },
    { id: "assigned", label: "Assigned" },
    { id: "in progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
  ];

  const getStatusBadgeClass = (status) => {
    return status.toLowerCase().replace(" ", "-");
  };

  const getPriorityClass = (priority) => {
    return priority.toLowerCase();
  };

  return (
    <div className="tasks-view">
      <div className="view-header">
        <h2>Task Management</h2>
        <button className="btn-primary" onClick={onCreateTask}>
          + Create New Task
        </button>
      </div>

      {/* Task Filters */}
      <div className="task-filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn ${
              activeFilter === filter.id ? "active" : ""
            }`}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
            {filter.id !== "all" && (
              <span className="filter-count">
                (
                {
                  tasks.filter((t) => t.status.toLowerCase() === filter.id)
                    .length
                }
                )
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      <div className="tasks-table">
        <table>
          <thead>
            <tr>
              <th>Task ID</th>
              <th>Title</th>
              <th>Customer</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No tasks found for the selected filter
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>#{task.taskCode}</td>
                  <td>
                    <div className="task-title">
                      <strong>{task.title}</strong>
                      <small>{task.customerAddress}</small>
                    </div>
                  </td>
                  <td>{task.customerName}</td>
                  <td>
                    <span
                      className={`priority ${getPriorityClass(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status ${getStatusBadgeClass(task.status)}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td>{task.assignedElectrician || "-"}</td>
                  <td>{new Date(task.scheduledDate).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      {task.status === "Pending" && (
                        <button
                          className="btn-assign"
                          onClick={() => onAssignTask(task)}
                        >
                          Assign
                        </button>
                      )}
                      <button
                        className="btn-view"
                        onClick={() => onViewTask(task)}
                      >
                        View
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => onEditTask(task)}
                      >
                        Edit
                      </button>
                      {task.status !== "Completed" && (
                        <button
                          className="btn-delete"
                          onClick={() => onDeleteTask(task)}
                          title="Delete Task"
                        >
                          Delete
                        </button>
                      )}
                    </div>
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

export default TaskManagementView;
