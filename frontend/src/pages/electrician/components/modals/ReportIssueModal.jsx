// components/modals/ReportIssueModal.jsx
import React from "react";

const ReportIssueModal = ({ task, onClose, onReport }) => {
  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const issueData = {
      issueType: formData.get("issueType"),
      description: formData.get("description"),
      action: formData.get("action"),
      priority: formData.get("priority"),
    };
    onReport(task, issueData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report Issue</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Task</label>
              <p>
                <strong>{task.title}</strong>
              </p>
              <p>Customer: {task.customer}</p>
            </div>

            <div className="form-group">
              <label>Issue Type *</label>
              <select name="issueType" required>
                <option value="">Select issue type</option>
                <option value="access">Cannot access location</option>
                <option value="materials">Materials not available</option>
                <option value="scope">
                  Work scope different than expected
                </option>
                <option value="safety">Safety concerns</option>
                <option value="customer">Customer not available</option>
                <option value="equipment">Equipment malfunction</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe the issue in detail. Include what you tried to resolve it and what assistance you need..."
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Requested Action *</label>
              <select name="action" required>
                <option value="">Select requested action</option>
                <option value="reschedule">Reschedule task</option>
                <option value="assistance">Need technical assistance</option>
                <option value="manager">Contact manager</option>
                <option value="customer_contact">Contact customer</option>
                <option value="materials">Provide additional materials</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select name="priority">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Report Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssueModal;
