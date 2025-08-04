// components/ProfileView.jsx
import React from "react";

const ProfileView = ({ userInfo, userProfile, stats }) => {
  // Use userProfile if available, fallback to userInfo
  const profile = userProfile || userInfo;
  
  // Parse skills and certifications from comma-separated strings
  const skills = profile.skills ? profile.skills.split(", ").filter(s => s) : [];
  const certifications = profile.certifications ? profile.certifications.split(", ").filter(c => c) : [];
  
  return (
    <div className="profile-section">
      <h2>My Profile</h2>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || profile.name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "E"}
          </div>
          <div className="profile-info">
            <h3>{profile.full_name || profile.name || "Electrician"}</h3>
            <p>Employee ID: {profile.employee_code || profile.id || "N/A"}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-group">
            <label>Email</label>
            <p>{profile.email || "Not provided"}</p>
          </div>
          <div className="detail-group">
            <label>Phone</label>
            <p>{profile.phone || "Not provided"}</p>
          </div>
          <div className="detail-group">
            <label>Role</label>
            <p>{profile.role || "Electrician"}</p>
          </div>
          <div className="detail-group">
            <label>Total Tasks Completed</label>
            <p>{profile.total_tasks_completed || stats.totalCompleted || 0}</p>
          </div>
          <div className="detail-group">
            <label>Join Date</label>
            <p>{profile.join_date ? new Date(profile.join_date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="skills-section">
          <h4>My Skills</h4>
          <div className="skills-list">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span key={index} className="skill">{skill}</span>
              ))
            ) : (
              <p className="no-data">No skills added yet</p>
            )}
          </div>
        </div>

        <div className="certifications">
          <h4>Certifications</h4>
          {certifications.length > 0 ? (
            <ul>
              {certifications.map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No certifications added yet</p>
          )}
        </div>
      </div>

      {/* Performance Overview */}
    </div>
  );
};

export default ProfileView;
