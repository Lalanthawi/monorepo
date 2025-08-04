// components/Reports.jsx
import React from "react";
import { dashboardService } from "../../../services/dashboard";

const Reports = ({ setReportData, setShowReportModal }) => {
  // Single report configuration
  const systemUsageReport = {
    id: 1,
    name: "System Usage Report",
    type: "system_usage",
    description:
      "Comprehensive report on user management, login patterns, and system activity",
    icon: "📈",
    color: "#2ecc71",
  };

  // Handle generate report
  const handleGenerateReport = async () => {
    try {
      const response = await dashboardService.generateReport({
        report_type: systemUsageReport.type,
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
      });

      if (response.success && response.data) {
        setReportData({
          ...response.data,
          reportName: systemUsageReport.name,
          reportType: systemUsageReport.type,
        });
        setShowReportModal(true);
      }
    } catch (error) {
      alert("Error generating report: " + error.message);
    }
  };

  return (
    <div className="reports-section">
      <h2>System Reports</h2>
      <p className="section-description">
        Generate comprehensive system usage report for analysis and monitoring
      </p>

      <div className="single-report-container">
        <div
          className="report-card"
          style={{ borderLeft: `4px solid ${systemUsageReport.color}` }}
        >
          <div
            className="report-icon"
            style={{ color: systemUsageReport.color }}
          >
            {systemUsageReport.icon}
          </div>
          <div className="report-content">
            <h3>{systemUsageReport.name}</h3>
            <p>{systemUsageReport.description}</p>
            <div className="report-features"></div>
          </div>
          <button className="generate-btn" onClick={handleGenerateReport}>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
