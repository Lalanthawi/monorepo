// components/manager/modals/ViewTaskModal.jsx
import React from "react";

const ViewTaskModal = ({ task, onClose, onEdit }) => {
  if (!task) return null;

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
          <div className="task-detail-header">
            <h3>{task.title}</h3>
            <div className="task-badges">
              <span className={`priority ${task.priority.toLowerCase()}`}>
                {task.priority} Priority
              </span>
              <span
                className={`status ${task.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {task.status}
              </span>
            </div>
          </div>

          <div className="detail-sections">
            <div className="detail-section">
              <h4>Task Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Task ID</label>
                  <p>#{task.taskCode}</p>
                </div>
                <div className="detail-item">
                  <label>Created By</label>
                  <p>{task.createdBy || "System"}</p>
                </div>
                <div className="detail-item">
                  <label>Assigned To</label>
                  <p>{task.assignedElectrician || "Not Assigned"}</p>
                </div>
                <div className="detail-item">
                  <label>Estimated Hours</label>
                  <p>{task.estimatedHours} hours</p>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Customer Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Customer Name</label>
                  <p>{task.customerName}</p>
                </div>
                <div className="detail-item">
                  <label>Phone Number</label>
                  <p>
                    <a href={`tel:${task.customerPhone}`}>
                      {task.customerPhone}
                    </a>
                  </p>
                </div>
                <div className="detail-item full-width">
                  <label>Address</label>
                  <p>{task.customerAddress}</p>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Schedule</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Date</label>
                  <p>{new Date(task.scheduledDate).toLocaleDateString()}</p>
                </div>
                <div className="detail-item">
                  <label>Start Time</label>
                  <p>{formatTime(task.scheduledTimeStart)}</p>
                </div>
                <div className="detail-item">
                  <label>End Time</label>
                  <p>{formatTime(task.scheduledTimeEnd)}</p>
                </div>
              </div>
            </div>

            {task.description && (
              <div className="detail-section">
                <h4>Description</h4>
                <p className="description">{task.description}</p>
              </div>
            )}

            {task.status === "Completed" && (task.completion_notes || task.materials_used || task.additional_charges) && (
              <div className="detail-section">
                <h4>Task Completion Details</h4>
                <div className="completion-details">
                  {task.completion_notes && (
                    <div className="completion-item">
                      <label>Completion Notes</label>
                      <p className="completion-text">{task.completion_notes}</p>
                    </div>
                  )}
                  {task.materials_used && (
                    <div className="completion-item">
                      <label>Materials Used</label>
                      <p className="completion-text">{task.materials_used}</p>
                    </div>
                  )}
                  {task.additional_charges && parseFloat(task.additional_charges) > 0 && (
                    <div className="completion-item">
                      <label>Additional Charges</label>
                      <p className="completion-text charges">
                        ${parseFloat(task.additional_charges).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {task.completed_at && (
                    <div className="completion-item">
                      <label>Completed At</label>
                      <p className="completion-text">
                        {new Date(task.completed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {task.rating && (
              <div className="detail-section">
                <h4>Customer Feedback</h4>
                <div className="feedback-section">
                  <div className="rating">
                    Rating: {"⭐".repeat(Math.min(task.rating, 5))}
                  </div>
                  {task.feedback && (
                    <p className="feedback-text">{task.feedback}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
          {task.status !== "Completed" && (
            <button className="btn-primary" onClick={() => onEdit(task)}>
              Edit Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTaskModal;
