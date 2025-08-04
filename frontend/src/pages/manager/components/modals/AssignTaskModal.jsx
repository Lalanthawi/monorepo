// components/manager/modals/AssignTaskModal.jsx
import React, { useState } from "react";

const AssignTaskModal = ({ task, electricians, onClose, onAssign }) => {
  const [selectedElectrician, setSelectedElectrician] = useState("");

  const availableElectricians = electricians.filter(
    (e) => e.status === "Available"
  );

  const handleAssign = async () => {
    if (!selectedElectrician) {
      alert("Please select an electrician");
      return;
    }

    try {
      await onAssign(task.id, selectedElectrician);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Task</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="task-details">
            <h3>{task.title}</h3>
            <p>
              {task.customerName} • {task.customerAddress}
            </p>
            <div className="task-meta">
              <span className={`priority ${task.priority.toLowerCase()}`}>
                {task.priority} Priority
              </span>
              <span>
                Due: {new Date(task.scheduledDate).toLocaleDateString()}
              </span>
              <span>Est: {task.estimatedHours} hours</span>
            </div>
          </div>

          <div className="electrician-list">
            <h4>Select Electrician</h4>
            {availableElectricians.length === 0 ? (
              <div className="no-data">
                No available electricians at the moment
              </div>
            ) : (
              availableElectricians.map((electrician) => (
                <div
                  key={electrician.id}
                  className={`electrician-option ${
                    selectedElectrician === electrician.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedElectrician(electrician.id)}
                >
                  <div className="electrician-info">
                    <div className="avatar">
                      {electrician.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h5>{electrician.name}</h5>
                      <p>
                        Completed: {electrician.tasksCompleted} tasks • Rating:
                        ⭐ {electrician.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="skills-mini">
                    {electrician.skills.slice(0, 2).map((skill, i) => (
                      <span key={i}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!selectedElectrician}
            onClick={handleAssign}
          >
            Assign Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;
