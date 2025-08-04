// components/modals/ViewProfileModal.jsx
import React from "react";

const ViewProfileModal = ({ electrician, onClose }) => {
  if (!electrician) return null;

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(" ", "-");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Electrician Profile</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-header">
            <div className="profile-avatar">
              {electrician.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="profile-info">
              <h3>{electrician.name}</h3>
              <p className="employee-code">ID: {electrician.employeeCode}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h4>Work Status</h4>
              <div className="detail-item">
                <span className="label">Current Status:</span>
                <span
                  className={`status ${getStatusClass(electrician.status)}`}
                >
                  {electrician.status}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Active Tasks:</span>
                <span>{electrician.currentTasks}</span>
              </div>
              <div className="detail-item">
                <span className="label">Completed Tasks:</span>
                <span>{electrician.tasksCompleted}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Skills & Expertise</h4>
              <div className="skills-list">
                {electrician.skills.map((skill, index) => (
                  <span key={index} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              if (electrician.phone) {
                window.location.href = `tel:${electrician.phone}`;
              } else {
                alert("No phone number available");
              }
            }}
          >
            Contact Electrician
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProfileModal;
