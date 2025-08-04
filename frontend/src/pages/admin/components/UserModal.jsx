// components/UserModal.jsx
import React, { useState } from "react";
import { usersService } from "../../../services/users";

const UserModal = ({
  modalType,
  formData,
  setFormData,
  setShowModal,
  loadDashboardData,
  selectedItem,
}) => {
  const [errors, setErrors] = useState({});

  // Available skills for dropdown
  const availableSkills = [
    "Residential Wiring",
    "Commercial Installation",
    "Industrial Wiring",
    "Emergency Repairs",
    "Solar Installation",
    "Maintenance",
    "Safety Inspection",
    "Panel Upgrades",
    "LED Lighting",
    "Smart Home Systems",
  ];

  // Available certifications for dropdown
  const availableCertifications = [
    "Level 1 Electrician",
    "Level 2 Electrician",
    "Level 3 Electrician",
    "Master Electrician",
    "Electrical Safety Certificate",
    "Industrial Electrician Certificate",
    "Solar Installation Certificate",
    "Smart Home Systems Certificate",
    "Emergency Response Certificate",
    "High Voltage Certificate",
  ];

  // Validate phone
  const validatePhoneNumber = (phone) => {
    // Remove spaces and special characters
    const cleanPhone = phone.replace(/[\s-]/g, "");

    // Sri Lankan phone number patterns:
    // +94XXXXXXXXX (with country code)
    // 0XXXXXXXXX (without country code)
    // Mobile numbers start with 07 or +947
    const sriLankanPhoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;

    return sriLankanPhoneRegex.test(cleanPhone);
  };

  // Format phone number
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    let cleaned = value.replace(/\D/g, "");

    // Handle Sri Lankan format
    if (cleaned.startsWith("94")) {
      cleaned = cleaned.substring(2);
    }
    if (!cleaned.startsWith("0") && cleaned.length > 0) {
      cleaned = "0" + cleaned;
    }

    // Limit to 10 digits
    cleaned = cleaned.substring(0, 10);

    // Format as 0XX XXX XXXX
    if (cleaned.length >= 6) {
      return (
        cleaned.slice(0, 3) + " " + cleaned.slice(3, 6) + " " + cleaned.slice(6)
      );
    } else if (cleaned.length >= 3) {
      return cleaned.slice(0, 3) + " " + cleaned.slice(3);
    }
    return cleaned;
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData({
        ...formData,
        [name]: formattedPhone,
      });

      // Clear phone error when user starts typing
      if (errors.phone) {
        setErrors({ ...errors, phone: "" });
      }
    } else if (name === "full_name") {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Clear full name error when user starts typing valid name
      if (errors.full_name && !validateFullName(value)) {
        setErrors({ ...errors, full_name: "" });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle skills selection
  const handleSkillsChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData({
      ...formData,
      skills: selectedOptions,
    });
  };

  // Handle certifications selection
  const handleCertificationsChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData({
      ...formData,
      certifications: selectedOptions,
    });
  };

  // Validate full name
  const validateFullName = (name) => {
    if (!name || name.trim() === "") {
      return "Full name is required";
    }

    const trimmedName = name.trim();

    // Check if full name contains only numbers
    if (/^\d+$/.test(trimmedName)) {
      return "Full name cannot be only numbers";
    }

    // Check if full name is primarily numbers (more than 70% numbers)
    const totalChars = trimmedName.replace(/\s/g, "").length;
    const numberChars = (trimmedName.match(/\d/g) || []).length;
    if (totalChars > 0 && numberChars / totalChars > 0.7) {
      return "Full name cannot be primarily numbers";
    }

    // Check minimum length (at least 2 characters)
    if (trimmedName.length < 2) {
      return "Full name must be at least 2 characters long";
    }

    return null;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate full name
    const fullNameError = validateFullName(formData.full_name);
    if (fullNameError) {
      newErrors.full_name = fullNameError;
    }

    if (modalType === "addUser") {
      if (!formData.username || formData.username.trim() === "") {
        newErrors.username = "Username is required";
      }

      if (!formData.email || formData.email.trim() === "") {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!formData.password || formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    // Phone validation
    if (!formData.phone || formData.phone.trim() === "") {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = "Please enter a valid mobile number (07X XXX XXXX)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Clean phone number before sending
      const cleanPhone = formData.phone.replace(/[\s-]/g, "");

      const userData = {
        ...formData,
        phone: cleanPhone,
        skills: Array.isArray(formData.skills)
          ? formData.skills.join(", ")
          : formData.skills,
        certifications: Array.isArray(formData.certifications)
          ? formData.certifications.join(", ")
          : formData.certifications,
      };

      let response;

      if (modalType === "editUser") {
        // For edit, don't send password unless it's being changed
        const updateData = {
          full_name: userData.full_name,
          phone: userData.phone,
          status: userData.status || "Active",
          skills: userData.skills,
          certifications: userData.certifications,
        };

        response = await usersService.update(selectedItem.id, updateData);
      } else {
        // For create, include all fields
        response = await usersService.create(userData);
      }

      if (response.success) {
        await loadDashboardData();
        setShowModal(false);
        resetForm();
        alert(
          modalType === "editUser"
            ? "User updated successfully!"
            : "User added successfully!"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        `Error ${modalType === "editUser" ? "updating" : "adding"} user: ${
          error.message
        }`
      );
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      full_name: "",
      phone: "",
      role: "Electrician",
      employee_code: "",
      skills: [],
      certifications: [],
      status: "Active",
    });
    setErrors({});
  };

  // Generate employee code
  const generateEmployeeCode = (role) => {
    const prefix =
      role === "Electrician" ? "ELC" : role === "Manager" ? "MGR" : "ADM";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNum}`;
  };

  // Handle role change
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData({
      ...formData,
      role: newRole,
      employee_code:
        modalType === "addUser"
          ? generateEmployeeCode(newRole)
          : formData.employee_code,
    });
  };

  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="user-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="user-modal-header">
          <div className="header-content">
            <div className="header-icon">
              {modalType === "addUser" ? "➕" : "✏️"}
            </div>
            <div className="header-text">
              <h2>
                {modalType === "addUser" ? "Add New User" : "Edit User Profile"}
              </h2>
              <p>
                {modalType === "addUser"
                  ? "Create a new user account"
                  : "Update user information"}
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="user-form-container">
          {modalType === "editUser" && selectedItem && (
            <div className="user-info-banner">
              <div className="user-avatar-large">
                {formData.full_name
                  ? formData.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </div>
              <div className="user-info-text">
                <h3>{formData.full_name || "User Name"}</h3>
                <p>
                  {formData.role} • {formData.employee_code || "No Code"}
                </p>
              </div>
            </div>
          )}

          <div className="form-section">
            <h4 className="section-title">
              <span className="section-icon">👤</span>
              Basic Information
            </h4>

            {modalType === "addUser" && (
              <div className="form-group elegant">
                <label className="form-label">
                  <span className="label-text">Employee Code</span>
                  <span className="label-badge">Auto-generated</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="employee_code"
                    value={formData.employee_code}
                    readOnly
                    className="form-input readonly"
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group elegant">
                <label className="form-label">
                  <span className="label-text">Username</span>
                  {modalType === "addUser" && (
                    <span className="label-required">*</span>
                  )}
                  {modalType === "editUser" && (
                    <span className="label-badge readonly">Read-only</span>
                  )}
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleFormChange}
                    required={modalType === "addUser"}
                    disabled={modalType === "editUser"}
                    placeholder="Enter username"
                    className={`form-input ${
                      modalType === "editUser" ? "readonly" : ""
                    } ${errors.username ? "error" : ""}`}
                  />
                </div>
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>

              <div className="form-group elegant">
                <label className="form-label">
                  <span className="label-text">Full Name</span>
                  <span className="label-required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter full name"
                    className={`form-input ${errors.full_name ? "error" : ""}`}
                  />
                </div>
                {errors.full_name && (
                  <span className="error-message">{errors.full_name}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group elegant">
                <label className="form-label">
                  <span className="label-text">Email Address</span>
                  {modalType === "addUser" && (
                    <span className="label-required">*</span>
                  )}
                  {modalType === "editUser" && (
                    <span className="label-badge readonly">Read-only</span>
                  )}
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required={modalType === "addUser"}
                    disabled={modalType === "editUser"}
                    placeholder="Enter email address"
                    className={`form-input ${
                      modalType === "editUser" ? "readonly" : ""
                    } ${errors.email ? "error" : ""}`}
                  />
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group elegant">
                <label className="form-label">
                  <span className="label-text">Phone Number</span>
                  <span className="label-required">*</span>
                  <span className="label-hint">(07X XXX XXXX)</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="07X XXX XXXX"
                    className={`form-input ${errors.phone ? "error" : ""}`}
                    maxLength="12"
                  />
                </div>
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title">
              <span className="section-icon">🛡️</span>
              Account Settings
            </h4>

            <div className="form-row">
              <div className="form-group elegant">
                <label className="form-label">
                  <span className="label-text">Role</span>
                  {modalType === "editUser" && (
                    <span className="label-badge readonly">Read-only</span>
                  )}
                </label>
                <div className="input-wrapper">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleRoleChange}
                    required
                    disabled={modalType === "editUser"}
                    className={`form-input ${
                      modalType === "editUser" ? "readonly" : ""
                    }`}
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              {modalType === "editUser" && (
                <div className="form-group elegant">
                  <label className="form-label">
                    <span className="label-text">Status</span>
                  </label>
                  <div className="input-wrapper">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="form-input"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {modalType === "addUser" && (
                <div className="form-group elegant">
                  <label className="form-label">
                    <span className="label-text">Password</span>
                    <span className="label-required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      required
                      placeholder="Enter password (min 6 chars)"
                      minLength="6"
                      className={`form-input ${errors.password ? "error" : ""}`}
                    />
                  </div>
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {formData.role === "Electrician" && (
            <div className="form-section">
              <h4 className="section-title">
                <span className="section-icon">⚡</span>
                Professional Details
              </h4>

              <div className="form-group elegant">
                <label className="form-label">
                  <span className="label-text">Skills</span>
                  <span className="label-hint">
                    Hold Ctrl/Cmd to select multiple
                  </span>
                </label>
                <div className="skills-container">
                  <select
                    multiple
                    name="skills"
                    value={formData.skills}
                    onChange={handleSkillsChange}
                    size="6"
                    className="skills-select"
                  >
                    {availableSkills.map((skill) => (
                      <option
                        key={skill}
                        value={skill}
                        className="skill-option"
                      >
                        {skill}
                      </option>
                    ))}
                  </select>
                  <div className="selected-skills">
                    <p className="selected-label">Selected Skills:</p>
                    <div className="skill-tags">
                      {formData.skills.length > 0 ? (
                        formData.skills.map((skill) => (
                          <span key={skill} className="skill-tag">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="no-skills">No skills selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group elegant">
                <label className="form-label">
                  <span className="label-text">Certifications</span>
                  <span className="label-hint">
                    Hold Ctrl/Cmd to select multiple
                  </span>
                </label>
                <div className="skills-container">
                  <select
                    multiple
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleCertificationsChange}
                    size="6"
                    className="skills-select"
                  >
                    {availableCertifications.map((cert) => (
                      <option key={cert} value={cert} className="skill-option">
                        {cert}
                      </option>
                    ))}
                  </select>
                  <div className="selected-skills">
                    <p className="selected-label">Selected Certifications:</p>
                    <div className="skill-tags">
                      {formData.certifications.length > 0 ? (
                        formData.certifications.map((cert) => (
                          <span
                            key={cert}
                            className="skill-tag certification-tag"
                          >
                            {cert}
                          </span>
                        ))
                      ) : (
                        <span className="no-skills">
                          No certifications selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowModal(false)}
            >
              <span>❌</span>
              Cancel
            </button>
            <button type="button" className="btn-save" onClick={handleSubmit}>
              <span>{modalType === "addUser" ? "➕" : "💾"}</span>
              {modalType === "addUser" ? "Add User" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .user-modal-content {
          background: white;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-modal-header {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .header-text h2 {
          margin: 0;
          color: white;
          font-size: 24px;
          font-weight: 600;
        }

        .header-text p {
          margin: 4px 0 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .modal-close-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 10px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .user-form-container {
          overflow-y: auto;
          max-height: calc(90vh - 80px);
          padding: 32px;
        }

        .user-info-banner {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
        }

        .user-avatar-large {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 600;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }

        .user-info-text h3 {
          margin: 0 0 4px;
          font-size: 20px;
          color: #1f2937;
        }

        .user-info-text p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .form-section {
          margin-bottom: 32px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 20px;
          font-size: 18px;
          color: #1f2937;
          font-weight: 600;
        }

        .section-icon {
          font-size: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .form-group.elegant {
          margin-bottom: 20px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .label-text {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .label-required {
          color: #ef4444;
          font-weight: 600;
        }

        .label-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .label-badge.readonly {
          background: #e5e7eb;
          color: #6b7280;
        }

        .label-badge:not(.readonly) {
          background: #dbeafe;
          color: #2563eb;
        }

        .label-hint {
          font-size: 12px;
          color: #6b7280;
          font-weight: 400;
          margin-left: auto;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          font-size: 18px;
          z-index: 1;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.readonly {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .form-input.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .error-message {
          display: block;
          color: #ef4444;
          font-size: 13px;
          margin-top: 4px;
          font-weight: 500;
        }

        .skills-container {
          background: #f9fafb;
          padding: 16px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
        }

        .skills-select {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          background: white;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .skill-option {
          padding: 8px;
          cursor: pointer;
        }

        .skill-option:hover {
          background: #f3f4f6;
        }

        .selected-skills {
          background: white;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .selected-label {
          margin: 0 0 8px;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag {
          background: #dbeafe;
          color: #2563eb;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
        }

        .skill-tag.certification-tag {
          background: #d5f4e6;
          color: #065f46;
        }

        .no-skills {
          color: #9ca3af;
          font-style: italic;
          font-size: 13px;
        }

        .modal-footer {
          padding: 24px 32px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          background: #f9fafb;
        }

        .btn-cancel,
        .btn-save {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-cancel {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-cancel:hover {
          background: #d1d5db;
          transform: translateY(-1px);
        }

        .btn-save {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        @media (max-width: 640px) {
          .user-modal-content {
            width: 95%;
            max-height: 95vh;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .user-form-container {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserModal;
