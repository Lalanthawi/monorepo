// components/manager/TeamView.jsx
import React from "react";

const TeamView = ({ electricians, onViewProfile }) => {
  const getStatusClass = (status) => {
    return status.toLowerCase().replace(" ", "-");
  };

  const handleContact = (electrician) => {
    if (electrician.phone) {
      window.location.href = `tel:${electrician.phone}`;
    } else {
      alert("No phone number available for this electrician");
    }
  };

  return (
    <div className="team-view">
      <h2>Team Management</h2>

      <div className="team-grid">
        {electricians.length === 0 ? (
          <div className="no-data">No electricians found</div>
        ) : (
          electricians.map((electrician) => (
            <div key={electrician.id} className="electrician-card">
              <div className="electrician-header">
                <div className="electrician-avatar">
                  {electrician.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>

              <h3>{electrician.name}</h3>
              <p className="electrician-code">ID: {electrician.employeeCode}</p>
              <p className="electrician-phone">
                📱 {electrician.phone || "No phone"}
              </p>

              <div className="electrician-status">
                <span
                  className={`status ${getStatusClass(electrician.status)}`}
                >
                  {electrician.status}
                </span>
                {electrician.currentTasks > 0 && (
                  <span className="current-tasks">
                    {electrician.currentTasks} active tasks
                  </span>
                )}
              </div>

              <div className="electrician-stats">
                <div className="stat">
                  <span>Current</span>
                  <strong>{electrician.currentTasks}</strong>
                </div>
                <div className="stat">
                  <span>Completed</span>
                  <strong>{electrician.tasksCompleted}</strong>
                </div>
              </div>

              <div className="skills">
                {electrician.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
                {electrician.skills.length > 3 && (
                  <span className="skill-tag">
                    +{electrician.skills.length - 3}
                  </span>
                )}
              </div>

              <div className="electrician-actions">
                <button onClick={() => onViewProfile(electrician)}>
                  View Profile
                </button>
                <button
                  onClick={() => handleContact(electrician)}
                  className="contact-btn"
                >
                  Contact
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamView;
