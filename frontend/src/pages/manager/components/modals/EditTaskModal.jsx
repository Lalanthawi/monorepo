import React, { useState, useEffect } from "react";

const EditTaskModal = ({ task, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    priority: "Medium",
    scheduled_date: "",
    scheduled_time_start: "",
    scheduled_time_end: "",
    estimated_hours: "",
    description: "",
    status: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        customer_name: task.customerName || "",
        customer_address: task.customerAddress || "",
        customer_phone: task.customerPhone || "",
        priority: task.priority || "Medium",
        scheduled_date: task.scheduledDate
          ? task.scheduledDate.split("T")[0]
          : "",
        scheduled_time_start: task.scheduledTimeStart || "",
        scheduled_time_end: task.scheduledTimeEnd || "",
        estimated_hours: task.estimatedHours || "",
        description: task.description || "",
        status: task.status || "",
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    // Auto-calculate estimated hours when time changes
    if (name === 'scheduled_time_start' || name === 'scheduled_time_end') {
      const startTime = name === 'scheduled_time_start' ? value : formData.scheduled_time_start;
      const endTime = name === 'scheduled_time_end' ? value : formData.scheduled_time_end;
      
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        
        if (end > start) {
          const diffInHours = (end - start) / (1000 * 60 * 60);
          // Round up to nearest half hour
          const roundedHours = Math.ceil(diffInHours * 2) / 2;
          updatedFormData.estimated_hours = roundedHours.toString();
        }
      }
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(task.id, formData);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Task #{task.taskCode}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Task Title*</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority*</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={task.status === "Completed"}
                >
                  <option value="Pending">Pending</option>
                  {/* Allow Assigned and In Progress tasks to be changed to Pending */}
                  {(task.status === "Assigned" || task.status === "In Progress" || task.status === "Pending") && (
                    <>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                    </>
                  )}
                  {task.status === "Completed" && (
                    <option value="Completed">Completed</option>
                  )}
                </select>
                {(task.status === "Assigned" || task.status === "In Progress") && (
                  <small className="info-text">
                    You can change this task to Pending to reassign to another electrician
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Estimated Hours*</label>
                <input
                  type="number"
                  name="estimated_hours"
                  value={formData.estimated_hours}
                  onChange={handleChange}
                  required
                  step="0.5"
                  min="0.5"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Customer Name*</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number*</label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address*</label>
              <input
                type="text"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Scheduled Date*</label>
                <input
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time*</label>
                <input
                  type="time"
                  name="scheduled_time_start"
                  value={formData.scheduled_time_start}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time*</label>
                <input
                  type="time"
                  name="scheduled_time_end"
                  value={formData.scheduled_time_end}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
