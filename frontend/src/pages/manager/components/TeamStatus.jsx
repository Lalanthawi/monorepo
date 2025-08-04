// components/manager/TeamStatus.jsx
import React from "react";

const TeamStatus = ({ electricians }) => {
  const getStatusClass = (status) => {
    return status.toLowerCase().replace(" ", "-");
  };

  const sortedElectricians = [...electricians].sort((a, b) => {
    // Sort by status priority: Available > On Task > Offline
    const statusPriority = { Available: 0, "On Task": 1, Offline: 2 };
    return statusPriority[a.status] - statusPriority[b.status];
  });

  return (
    <div className="overview-card">
      <h3>Team Status</h3>
      <div className="team-status">
        {sortedElectricians.length === 0 ? (
          <div className="no-data">No team members found</div>
        ) : (
          sortedElectricians.map((electrician) => (
            <div key={electrician.id} className="team-member">
              <div className="member-info">
                <div className="member-avatar">
                  {electrician.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h4>{electrician.name}</h4>
                  <p>
                    Tasks: {electrician.currentTasks} active,{" "}
                    {electrician.tasksCompleted} completed
                  </p>
                </div>
              </div>
              <span
                className={`member-status ${getStatusClass(
                  electrician.status
                )}`}
              >
                {electrician.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamStatus;
