// components/ReportModal.jsx - Beautiful UI Design
import React from "react";
import "./ReportModal.css";

const ReportModal = ({ reportData, setShowReportModal, stats, activities }) => {
  // Get user statistics from report data
  const getUserStats = () => {
    if (!reportData || !reportData.user_statistics) {
      return {
        total: stats.totalUsers || 0,
        admins: stats.admins || 0,
        managers: stats.managers || 0,
        electricians: stats.electricians || 0,
        activeUsers: 0,
        inactiveUsers: 0,
      };
    }

    return {
      total: reportData.user_statistics.total || 0,
      admins: reportData.user_statistics.by_role.admins || 0,
      managers: reportData.user_statistics.by_role.managers || 0,
      electricians: reportData.user_statistics.by_role.electricians || 0,
      activeUsers: reportData.user_statistics.by_status.active || 0,
      inactiveUsers: reportData.user_statistics.by_status.inactive || 0,
    };
  };

  const userStats = getUserStats();

  // Download report as HTML
  const downloadReport = () => {
    const reportContent = document.getElementById("report-content-to-download");
    
    // Get all the CSS for the report
    const style = `
      body { 
        margin: 0; 
        padding: 20px; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        color: #1f2937;
        line-height: 1.6;
      }
      
      .report-content { 
        max-width: 1200px; 
        margin: 0 auto; 
        background: white;
        padding: 40px;
      }
      
      .report-header {
        text-align: center;
        margin-bottom: 48px;
        padding-bottom: 32px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .header-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .logo-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
      }
      
      .company-info h1 {
        margin: 0;
        font-size: 28px;
        color: #1f2937;
        font-weight: 700;
      }
      
      .company-info p {
        margin: 4px 0 0;
        color: #6b7280;
        font-size: 16px;
      }
      
      .report-title h2 {
        margin: 0 0 8px;
        font-size: 36px;
        color: #111827;
        font-weight: 700;
      }
      
      .report-date {
        color: #6b7280;
        font-size: 16px;
        margin: 0;
      }
      
      .report-section {
        margin-bottom: 48px;
      }
      
      .section-header {
        margin-bottom: 24px;
      }
      
      .section-header h3 {
        margin: 0 0 12px;
        font-size: 24px;
        color: #1f2937;
        font-weight: 600;
      }
      
      .section-line {
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, transparent);
        border-radius: 2px;
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 32px;
      }
      
      .stat-card {
        background: #f9fafb;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .stat-card.total-users { border-left: 4px solid #3b82f6; }
      .stat-card.admins { border-left: 4px solid #8b5cf6; }
      .stat-card.managers { border-left: 4px solid #ec4899; }
      .stat-card.electricians { border-left: 4px solid #f59e0b; }
      
      .stat-icon-wrapper {
        width: 56px;
        height: 56px;
        background: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      
      .stat-icon {
        font-size: 28px;
      }
      
      .stat-label {
        margin: 0 0 4px;
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
      }
      
      .stat-value {
        margin: 0;
        font-size: 32px;
        color: #1f2937;
        font-weight: 700;
      }
      
      .status-distribution {
        background: #f9fafb;
        padding: 32px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        margin-bottom: 32px;
      }
      
      .status-distribution h4 {
        margin: 0 0 20px;
        font-size: 18px;
        color: #1f2937;
        font-weight: 600;
      }
      
      .distribution-content {
        display: flex;
        gap: 32px;
        align-items: center;
      }
      
      .distribution-stats {
        flex: 1;
      }
      
      .distribution-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .distribution-item:last-child {
        border-bottom: none;
      }
      
      .distribution-label {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        color: #4b5563;
      }
      
      .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      
      .status-dot.active { background: #10b981; }
      .status-dot.inactive { background: #ef4444; }
      
      .distribution-value {
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .distribution-visual {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .pie-chart {
        position: relative;
        width: 150px;
        height: 150px;
      }
      
      .pie {
        width: 100%;
        height: 100%;
      }
      
      .pie-text {
        font-size: 20px;
        font-weight: 700;
        fill: #1f2937;
      }
      
      .pie-label {
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
      }
      
      .activity-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 32px;
      }
      
      .metric-card {
        background: linear-gradient(135deg, #f9fafb, #f3f4f6);
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        text-align: center;
      }
      
      .metric-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }
      
      .metric-info h5 {
        margin: 0 0 4px;
        font-size: 28px;
        color: #1f2937;
        font-weight: 700;
      }
      
      .metric-info p {
        margin: 0;
        font-size: 14px;
        color: #6b7280;
      }
      
      .activity-table-container {
        background: #f9fafb;
        padding: 32px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        margin-top: 32px;
      }
      
      .activity-table-container h4 {
        margin: 0 0 20px;
        font-size: 18px;
        color: #1f2937;
        font-weight: 600;
      }
      
      .elegant-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .elegant-table thead {
        background: #f3f4f6;
      }
      
      .elegant-table th {
        padding: 16px;
        text-align: left;
        font-weight: 600;
        color: #374151;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .elegant-table td {
        padding: 16px;
        border-bottom: 1px solid #f3f4f6;
        font-size: 14px;
        color: #4b5563;
      }
      
      .text-center { text-align: center; }
      
      .user-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .user-avatar-small {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      }
      
      .role-pill {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }
      
      .role-pill.admin { background: #ddd6fe; color: #6b21a8; }
      .role-pill.manager { background: #fce7f3; color: #be185d; }
      .role-pill.electrician { background: #fed7aa; color: #c2410c; }
      
      .time-cell { color: #6b7280; }
      .ip-cell { font-family: monospace; color: #6b7280; }
      
      .activity-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
      
      .activity-stat-card {
        background: white;
        padding: 32px;
        border-radius: 16px;
        border: 1px solid #e5e7eb;
        text-align: center;
      }
      
      .activity-stat-card.new-registrations { border-top: 4px solid #10b981; }
      .activity-stat-card.password-resets { border-top: 4px solid #3b82f6; }
      .activity-stat-card.deleted-users { border-top: 4px solid #ef4444; }
      
      .activity-stat-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .activity-stat-icon { font-size: 24px; }
      
      .activity-stat-header h5 {
        margin: 0;
        font-size: 16px;
        color: #6b7280;
        font-weight: 500;
      }
      
      .activity-stat-value {
        font-size: 48px;
        font-weight: 700;
        color: #1f2937;
        margin: 16px 0;
      }
      
      .activity-stat-period {
        font-size: 14px;
        color: #6b7280;
        margin-top: 8px;
      }
      
      .report-footer {
        text-align: center;
        padding: 32px;
        border-top: 2px solid #e5e7eb;
        margin-top: 48px;
        color: #6b7280;
      }
      
      .report-footer p {
        margin: 4px 0;
        font-size: 14px;
      }
      
      @media print {
        body { margin: 0; }
        .stats-grid { grid-template-columns: repeat(4, 1fr); }
      }
    `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>System Usage Report - ${new Date().toLocaleDateString()}</title>
        <style>
          ${style}
          body { margin: 20px; font-family: Arial, sans-serif; }
          .modal-overlay, .modal-header button, .modal-actions { display: none !important; }
        </style>
      </head>
      <body>
        ${reportContent.outerHTML}
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `System_Usage_Report_${
      new Date().toISOString().split("T")[0]
    }.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Render report content
  const renderReportContent = () => {
    if (!reportData) return null;

    return (
      <div
        id="report-content-to-download"
        className="report-content system-usage-report"
      >
        <div className="report-header">
          <div className="header-logo">
            <div className="logo-circle">⚡</div>
            <div className="company-info">
              <h1>Kandy Electricians</h1>
              <p>Task Management System</p>
            </div>
          </div>
          <div className="report-title">
            <h2>System Usage Report</h2>
            <p className="report-date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="report-section">
          <div className="section-header">
            <h3>📊 User Management Overview</h3>
            <div className="section-line"></div>
          </div>

          <div className="stats-grid">
            <div className="stat-card total-users">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">👥</div>
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Users</p>
                <h4 className="stat-value">{userStats.total || 0}</h4>
              </div>
              <div className="stat-decoration"></div>
            </div>

            <div className="stat-card admins">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">👨‍💼</div>
              </div>
              <div className="stat-info">
                <p className="stat-label">Administrators</p>
                <h4 className="stat-value">{userStats.admins || 0}</h4>
              </div>
              <div className="stat-decoration"></div>
            </div>

            <div className="stat-card managers">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">📋</div>
              </div>
              <div className="stat-info">
                <p className="stat-label">Managers</p>
                <h4 className="stat-value">{userStats.managers || 0}</h4>
              </div>
              <div className="stat-decoration"></div>
            </div>

            <div className="stat-card electricians">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">⚡</div>
              </div>
              <div className="stat-info">
                <p className="stat-label">Electricians</p>
                <h4 className="stat-value">{userStats.electricians || 0}</h4>
              </div>
              <div className="stat-decoration"></div>
            </div>
          </div>

          <div className="status-distribution">
            <h4>User Status Distribution</h4>
            <div className="distribution-content">
              <div className="distribution-stats">
                <div className="distribution-item">
                  <div className="distribution-label">
                    <span className="status-dot active"></span>
                    <span>Active Users</span>
                  </div>
                  <span className="distribution-value">
                    {userStats.activeUsers}
                  </span>
                </div>
                <div className="distribution-item">
                  <div className="distribution-label">
                    <span className="status-dot inactive"></span>
                    <span>Inactive Users</span>
                  </div>
                  <span className="distribution-value">
                    {userStats.inactiveUsers}
                  </span>
                </div>
              </div>
              <div className="distribution-visual">
                <div className="pie-chart">
                  <svg viewBox="0 0 100 100" className="pie">
                    <circle
                      r="40"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      stroke="#ef4444"
                      strokeWidth="20"
                      strokeDasharray={`${userStats.total > 0 ? (userStats.inactiveUsers / userStats.total) * 251.2 : 0} 251.2`}
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      r="40"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray={`${userStats.total > 0 ? (userStats.activeUsers / userStats.total) * 251.2 : 0} 251.2`}
                      strokeDashoffset={`${userStats.total > 0 ? -(userStats.inactiveUsers / userStats.total) * 251.2 : 0}`}
                      transform="rotate(-90 50 50)"
                    />
                    <text x="50" y="50" textAnchor="middle" dy="0.3em" className="pie-text">
                      {userStats.total > 0 ? Math.round((userStats.activeUsers / userStats.total) * 100) : 0}%
                    </text>
                  </svg>
                  <div className="pie-label">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="report-section">
          <div className="section-header">
            <h3>🔐 Login Activity Summary</h3>
            <div className="section-line"></div>
          </div>

          <div className="activity-metrics">
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-info">
                <h5>{reportData.login_activity?.last_30_days?.total_logins || 0}</h5>
                <p>Total Logins</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">👤</div>
              <div className="metric-info">
                <h5>{reportData.login_activity?.last_30_days?.unique_users || 0}</h5>
                <p>Unique Users</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📅</div>
              <div className="metric-info">
                <h5>30</h5>
                <p>Days Period</p>
              </div>
            </div>
          </div>

          <div className="activity-table-container">
            <h4>Recent Login Activity</h4>
            <table className="elegant-table">
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>#</th>
                  <th style={{ width: "30%" }}>User</th>
                  <th style={{ width: "20%" }}>Role</th>
                  <th style={{ width: "25%" }}>Login Time</th>
                  <th style={{ width: "15%" }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.login_activity?.recent_logins || []).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center" style={{ padding: "20px", color: "#6b7280" }}>
                      No recent login activity
                    </td>
                  </tr>
                ) : (
                  (reportData.login_activity?.recent_logins || []).map((login, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">
                            {(login.user_name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span>{login.user_name || "Unknown"}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`role-pill ${(
                            login.role || "electrician"
                          ).toLowerCase()}`}
                        >
                          {login.role || "Electrician"}
                        </span>
                      </td>
                      <td className="time-cell">
                        {new Date(login.login_time).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="ip-cell">
                        {login.ip_address || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-section">
          <div className="section-header">
            <h3>📈 Account Activity Summary</h3>
            <div className="section-line"></div>
          </div>

          <div className="activity-cards three-column">
            <div className="activity-stat-card new-registrations">
              <div className="activity-stat-header">
                <div className="activity-stat-icon">👤</div>
                <h5>New Registrations</h5>
              </div>
              <div className="activity-stat-value">
                {reportData.account_activity?.new_registrations || 0}
              </div>
              <div className="activity-stat-period">Last 30 Days</div>
              <div className="activity-stat-bg"></div>
            </div>

            <div className="activity-stat-card password-resets">
              <div className="activity-stat-header">
                <div className="activity-stat-icon">🔑</div>
                <h5>Password Resets</h5>
              </div>
              <div className="activity-stat-value">
                {reportData.account_activity?.password_resets || 0}
              </div>
              <div className="activity-stat-period">Last 30 Days</div>
              <div className="activity-stat-bg"></div>
            </div>

            <div className="activity-stat-card deleted-users">
              <div className="activity-stat-header">
                <div className="activity-stat-icon">🚫</div>
                <h5>Deactivated Users</h5>
              </div>
              <div className="activity-stat-value">
                {reportData.account_activity?.deactivated_users || 0}
              </div>
              <div className="activity-stat-period">Current Status</div>
              <div className="activity-stat-bg"></div>
            </div>
          </div>
        </div>

        <div className="report-footer">
          <p>Generated by Kandy Electricians Task Management System</p>
          <p>© {new Date().getFullYear()} All Rights Reserved</p>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={() => setShowReportModal(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div
        className="modal-content report-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          width: '90vw',
          maxWidth: '1400px',
          height: '90vh',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div className="modal-header">
          <h2>System Usage Report</h2>
          <button
            className="close-btn"
            onClick={() => setShowReportModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">{renderReportContent()}</div>

        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowReportModal(false)}
          >
            Close
          </button>
          <button className="btn-download" onClick={downloadReport}>
            <span>⬇</span> Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
