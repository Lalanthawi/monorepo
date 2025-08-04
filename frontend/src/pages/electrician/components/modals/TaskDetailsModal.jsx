// components/modals/TaskDetailsModal.jsx
import React from "react";

const TaskDetailsModal = ({ task, onClose, onStartTask }) => {
  if (!task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Task Details</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="task-detail-section">
            <h3>{task.title}</h3>
            <span className={`priority ${task.priority.toLowerCase()}`}>
              {task.priority} Priority
            </span>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <label>Task ID</label>
              <p>{task.id}</p>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <p>{task.status}</p>
            </div>
            <div className="detail-item">
              <label>Customer</label>
              <p>{task.customer}</p>
            </div>
            <div className="detail-item">
              <label>Phone</label>
              <p>
                <a href={`tel:${task.phone}`}>{task.phone}</a>
              </p>
            </div>
            <div className="detail-item">
              <label>Address</label>
              <p>{task.address}</p>
            </div>
            <div className="detail-item">
              <label>Scheduled Time</label>
              <p>{task.scheduledTime}</p>
            </div>
            <div className="detail-item">
              <label>Estimated Hours</label>
              <p>{task.estimatedHours} hours</p>
            </div>
          </div>

          <div className="description-section">
            <label>Description</label>
            <p>{task.description || "No description provided"}</p>
          </div>

          {task.materials && task.materials.length > 0 && (
            <div className="materials-section">
              <label>Required Materials</label>
              <ul>
                {task.materials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}

          {task.completionNotes && (
            <div className="completion-section">
              <label>Completion Notes</label>
              <p>{task.completionNotes}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
          {(task.status === "Pending" || task.status === "Assigned") && (
            <button
              className="btn-primary"
              onClick={() => {
                onClose();
                onStartTask(task);
              }}
            >
              Start Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
