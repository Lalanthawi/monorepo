// components/modals/DailyTasksReportModal.jsx
import React, { useState, useEffect } from "react";

const DailyTasksReportModal = ({ tasks, onClose }) => {
  const [reportData, setReportData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    generateReport();
  }, [selectedDate, tasks]);

  const generateReport = () => {
    // Filter tasks for selected date
    const filteredTasks = tasks.filter((task) => {
      const taskDate = task.scheduledDate;
      return taskDate === selectedDate;
    });

    // Calculate summary statistics
    const summary = {
      totalTasks: filteredTasks.length,
      completed: filteredTasks.filter((t) => t.status === "Completed").length,
      pending: filteredTasks.filter((t) => t.status === "Pending").length,
      assigned: filteredTasks.filter((t) => t.status === "Assigned").length,
      inProgress: filteredTasks.filter((t) => t.status === "In Progress")
        .length,
      newTasks: filteredTasks.filter((t) => {
        const createdAtValue = t.createdAt || t.created_at;
        const createdDate = createdAtValue && createdAtValue.includes("T") ? createdAtValue.split("T")[0] : createdAtValue;
        return createdDate === selectedDate;
      }).length,
    };

    // Priority breakdown
    const priorityBreakdown = {
      high: filteredTasks.filter((t) => t.priority === "High").length,
      medium: filteredTasks.filter((t) => t.priority === "Medium").length,
      low: filteredTasks.filter((t) => t.priority === "Low").length,
    };

    setReportData({
      date: selectedDate,
      summary,
      priorityBreakdown,
      allTasks: filteredTasks,
    });
  };

  const downloadPDF = () => {
    // Create a temporary element for printing
    const printWindow = window.open("", "_blank");
    const reportDate = new Date(selectedDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Tasks Report - ${reportDate}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #2563eb; 
            margin: 0 0 10px 0;
          }
          .header p { 
            color: #666; 
            margin: 5px 0;
          }
          .section { 
            margin-bottom: 30px; 
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          .section h2 { 
            color: #2563eb; 
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
          }
          .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
            margin: 20px 0;
          }
          .stat-box { 
            background: white; 
            padding: 15px; 
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            text-align: center;
          }
          .stat-box h3 { 
            color: #666; 
            margin: 0 0 10px 0;
            font-size: 14px;
          }
          .stat-box .value { 
            font-size: 28px; 
            font-weight: bold; 
            color: #2563eb;
          }
          .priority-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          .priority-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .priority-item.high { border-left: 4px solid #dc2626; }
          .priority-item.medium { border-left: 4px solid #f59e0b; }
          .priority-item.low { border-left: 4px solid #10b981; }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Tasks Report</h1>
          <p>${reportDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <h2>Task Summary</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <h3>Total Tasks</h3>
              <div class="value">${reportData.summary.totalTasks}</div>
            </div>
            <div class="stat-box">
              <h3>Completed</h3>
              <div class="value">${reportData.summary.completed}</div>
            </div>
            <div class="stat-box">
              <h3>Pending</h3>
              <div class="value">${reportData.summary.pending}</div>
            </div>
            <div class="stat-box">
              <h3>In Progress</h3>
              <div class="value">${reportData.summary.inProgress}</div>
            </div>
            <div class="stat-box">
              <h3>Assigned</h3>
              <div class="value">${reportData.summary.assigned}</div>
            </div>
            <div class="stat-box">
              <h3>New Tasks</h3>
              <div class="value">${reportData.summary.newTasks}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Priority Breakdown</h2>
          <div class="priority-grid">
            <div class="priority-item high">
              <h3>High Priority</h3>
              <div class="value">${reportData.priorityBreakdown.high}</div>
            </div>
            <div class="priority-item medium">
              <h3>Medium Priority</h3>
              <div class="value">${reportData.priorityBreakdown.medium}</div>
            </div>
            <div class="priority-item low">
              <h3>Low Priority</h3>
              <div class="value">${reportData.priorityBreakdown.low}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This report was automatically generated by the Task Management System</p>
          <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const downloadCSV = () => {
    if (!reportData) return;

    // Create CSV content
    let csvContent = "Daily Tasks Report\n";
    csvContent += `Date: ${new Date(selectedDate).toLocaleDateString()}\n\n`;

    // Summary section
    csvContent += "TASK SUMMARY\n";
    csvContent += "Metric,Count\n";
    csvContent += `Total Tasks,${reportData.summary.totalTasks}\n`;
    csvContent += `Completed,${reportData.summary.completed}\n`;
    csvContent += `Pending,${reportData.summary.pending}\n`;
    csvContent += `In Progress,${reportData.summary.inProgress}\n`;
    csvContent += `Assigned,${reportData.summary.assigned}\n`;
    csvContent += `New Tasks,${reportData.summary.newTasks}\n\n`;

    // Priority breakdown
    csvContent += "PRIORITY BREAKDOWN\n";
    csvContent += "Priority,Count\n";
    csvContent += `High,${reportData.priorityBreakdown.high}\n`;
    csvContent += `Medium,${reportData.priorityBreakdown.medium}\n`;
    csvContent += `Low,${reportData.priorityBreakdown.low}\n\n`;

    // Task details
    csvContent += "TASK DETAILS\n";
    csvContent += "Task ID,Title,Customer,Status,Priority,Scheduled Date\n";
    reportData.allTasks.forEach((task) => {
      csvContent += `${task.taskCode},${task.title},"${task.customerName}",${
        task.status
      },${task.priority},${new Date(
        task.scheduledDate
      ).toLocaleDateString()}\n`;
    });

    // Download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daily-tasks-report-${selectedDate}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!reportData) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content report-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Daily Tasks Report</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Date Selector */}
          <div className="date-selector">
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Report Content */}
          <div className="report-content">
            {/* Task Summary Section */}
            <div className="report-section">
              <h3>📊 Task Summary</h3>
              <div className="summary-grid">
                <div className="summary-card total">
                  <div className="card-icon">📋</div>
                  <div className="card-content">
                    <h4>Total Tasks</h4>
                    <p className="value">{reportData.summary.totalTasks}</p>
                  </div>
                </div>
                <div className="summary-card completed">
                  <div className="card-icon">✅</div>
                  <div className="card-content">
                    <h4>Completed</h4>
                    <p className="value">{reportData.summary.completed}</p>
                    <p className="percentage">
                      {reportData.summary.totalTasks > 0
                        ? `${Math.round(
                            (reportData.summary.completed /
                              reportData.summary.totalTasks) *
                              100
                          )}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
                <div className="summary-card pending">
                  <div className="card-icon">⏳</div>
                  <div className="card-content">
                    <h4>Pending</h4>
                    <p className="value">{reportData.summary.pending}</p>
                  </div>
                </div>
                <div className="summary-card in-progress">
                  <div className="card-icon">🔄</div>
                  <div className="card-content">
                    <h4>In Progress</h4>
                    <p className="value">{reportData.summary.inProgress}</p>
                  </div>
                </div>
                <div className="summary-card assigned">
                  <div className="card-icon">👤</div>
                  <div className="card-content">
                    <h4>Assigned</h4>
                    <p className="value">{reportData.summary.assigned}</p>
                  </div>
                </div>
                <div className="summary-card new">
                  <div className="card-icon">🆕</div>
                  <div className="card-content">
                    <h4>New Today</h4>
                    <p className="value">{reportData.summary.newTasks}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="report-section">
              <h3>🎯 Priority Breakdown</h3>
              <div className="priority-breakdown">
                <div className="priority-item high">
                  <div className="priority-header">
                    <span className="priority-label">High Priority</span>
                    <span className="priority-count">
                      {reportData.priorityBreakdown.high}
                    </span>
                  </div>
                  <div className="priority-bar">
                    <div
                      className="priority-fill"
                      style={{
                        width: `${
                          reportData.summary.totalTasks > 0
                            ? (reportData.priorityBreakdown.high /
                                reportData.summary.totalTasks) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="priority-item medium">
                  <div className="priority-header">
                    <span className="priority-label">Medium Priority</span>
                    <span className="priority-count">
                      {reportData.priorityBreakdown.medium}
                    </span>
                  </div>
                  <div className="priority-bar">
                    <div
                      className="priority-fill"
                      style={{
                        width: `${
                          reportData.summary.totalTasks > 0
                            ? (reportData.priorityBreakdown.medium /
                                reportData.summary.totalTasks) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="priority-item low">
                  <div className="priority-header">
                    <span className="priority-label">Low Priority</span>
                    <span className="priority-count">
                      {reportData.priorityBreakdown.low}
                    </span>
                  </div>
                  <div className="priority-bar">
                    <div
                      className="priority-fill"
                      style={{
                        width: `${
                          reportData.summary.totalTasks > 0
                            ? (reportData.priorityBreakdown.low /
                                reportData.summary.totalTasks) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Distribution Chart */}
            <div className="report-section">
              <h3>📈 Status Distribution</h3>
              <div className="status-chart">
                <div className="chart-container">
                  {Object.entries({
                    Completed: reportData.summary.completed,
                    "In Progress": reportData.summary.inProgress,
                    Assigned: reportData.summary.assigned,
                    Pending: reportData.summary.pending,
                  }).map(([status, count]) => (
                    <div key={status} className="chart-bar">
                      <div className="bar-label">{status}</div>
                      <div className="bar-container">
                        <div
                          className={`bar-fill ${status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          style={{
                            height: `${
                              reportData.summary.totalTasks > 0
                                ? (count / reportData.summary.totalTasks) * 200
                                : 0
                            }px`,
                          }}
                        >
                          <span className="bar-value">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="download-buttons">
            <button className="btn-download pdf" onClick={downloadPDF}>
              <i className="fas fa-file-pdf"></i> Download PDF
            </button>
            <button className="btn-download csv" onClick={downloadCSV}>
              <i className="fas fa-file-csv"></i> Download CSV
            </button>
          </div>
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyTasksReportModal;
