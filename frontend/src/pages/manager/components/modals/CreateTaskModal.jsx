// components/manager/modals/CreateTaskModal.jsx
import React, { useState, useEffect } from "react";

const CreateTaskModal = ({ onClose, onCreate }) => {
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
    materials: [],
  });

  const [errors, setErrors] = useState({});

  // Calculate estimated hours when start and end times change
  useEffect(() => {
    if (formData.scheduled_time_start && formData.scheduled_time_end) {
      calculateEstimatedHours();
    }
  }, [formData.scheduled_time_start, formData.scheduled_time_end]);

  const calculateEstimatedHours = () => {
    const start = formData.scheduled_time_start.split(":");
    const end = formData.scheduled_time_end.split(":");

    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);

    let diffMinutes = endMinutes - startMinutes;

    // Handle case where end time is next day
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    const hours = diffMinutes / 60;
    // Round up to nearest half hour
    const roundedHours = Math.ceil(hours * 2) / 2;

    setFormData((prev) => ({
      ...prev,
      estimated_hours: roundedHours.toString(),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    // Customer name validation
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Customer name is required";
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.customer_phone.replace(/\D/g, ""))) {
      newErrors.customer_phone = "Please enter a valid 10-digit phone number";
    }

    // Address validation
    if (!formData.customer_address.trim()) {
      newErrors.customer_address = "Customer address is required";
    }

    // Date validation (no past dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.scheduled_date);
    if (selectedDate < today) {
      newErrors.scheduled_date = "Cannot schedule tasks for past dates";
    }

    // Time validation
    if (!formData.scheduled_time_start) {
      newErrors.scheduled_time_start = "Start time is required";
    }
    if (!formData.scheduled_time_end) {
      newErrors.scheduled_time_end = "End time is required";
    }

    // Validate end time is after start time (if same day)
    if (formData.scheduled_time_start && formData.scheduled_time_end) {
      const start = formData.scheduled_time_start.split(":");
      const end = formData.scheduled_time_end.split(":");
      const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
      const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);

      if (endMinutes <= startMinutes) {
        newErrors.scheduled_time_end = "End time must be after start time";
      }
    }

    // Estimated hours validation (0.5 to 24 hours)
    const hours = parseFloat(formData.estimated_hours);
    if (isNaN(hours) || hours < 0.5 || hours > 24) {
      newErrors.estimated_hours = "Estimated hours must be between 0.5 and 24";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format phone number as user types
    if (name === "customer_phone") {
      const formatted = value.replace(/\D/g, "").slice(0, 10);
      setFormData({
        ...formData,
        [name]: formatted,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onCreate(formData);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Task</h2>
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
                  placeholder="Brief description of the task"
                  className={errors.title ? "error" : ""}
                />
                {errors.title && (
                  <small className="error-text">{errors.title}</small>
                )}
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
                  <option value="Urgent">Urgent</option>
                </select>
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
                  placeholder="John Doe"
                  className={errors.customer_name ? "error" : ""}
                />
                {errors.customer_name && (
                  <small className="error-text">{errors.customer_name}</small>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number*</label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  placeholder="0771234567"
                  maxLength="10"
                  className={errors.customer_phone ? "error" : ""}
                />
                {errors.customer_phone && (
                  <small className="error-text">{errors.customer_phone}</small>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Customer Address*</label>
              <input
                type="text"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                placeholder="123 Main Street, Kandy"
                className={errors.customer_address ? "error" : ""}
              />
              {errors.customer_address && (
                <small className="error-text">{errors.customer_address}</small>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Scheduled Date*</label>
                <input
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  min={getTodayDate()}
                  className={errors.scheduled_date ? "error" : ""}
                />
                {errors.scheduled_date && (
                  <small className="error-text">{errors.scheduled_date}</small>
                )}
              </div>

              <div className="form-group">
                <label>Start Time*</label>
                <input
                  type="time"
                  name="scheduled_time_start"
                  value={formData.scheduled_time_start}
                  onChange={handleChange}
                  className={errors.scheduled_time_start ? "error" : ""}
                />
                {errors.scheduled_time_start && (
                  <small className="error-text">
                    {errors.scheduled_time_start}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>End Time*</label>
                <input
                  type="time"
                  name="scheduled_time_end"
                  value={formData.scheduled_time_end}
                  onChange={handleChange}
                  className={errors.scheduled_time_end ? "error" : ""}
                />
                {errors.scheduled_time_end && (
                  <small className="error-text">
                    {errors.scheduled_time_end}
                  </small>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Estimated Hours*</label>
              <input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                step="0.5"
                min="0.5"
                max="24"
                placeholder="Auto-calculated based on time"
                className={errors.estimated_hours ? "error" : ""}
              />
              {errors.estimated_hours && (
                <small className="error-text">{errors.estimated_hours}</small>
              )}
              <small>
                Auto-calculated from start and end time, but can be edited
              </small>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Detailed description of the work required..."
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
