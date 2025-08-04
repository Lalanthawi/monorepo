// components/modals/CompleteTaskModal.jsx
import React from "react";

const CompleteTaskModal = ({ task, onClose, onComplete }) => {
  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const completionData = {
      completionNotes: formData.get("notes"),
      materialsUsed: formData.get("materials"),
      additionalCharges: formData.get("charges"),
    };
    onComplete(task, completionData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Task</h2>
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
              <label>Completion Notes *</label>
              <textarea
                name="notes"
                rows="4"
                placeholder="Describe the work completed, any issues encountered, and final status..."
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Materials Used</label>
              <textarea
                name="materials"
                rows="3"
                placeholder="List any materials used (e.g., 2x electrical outlets, 10ft wire, etc.)"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Additional Charges (if any)</label>
              <input
                type="number"
                name="charges"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <small>
                Enter any additional charges for materials or extra work
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Complete Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteTaskModal;
