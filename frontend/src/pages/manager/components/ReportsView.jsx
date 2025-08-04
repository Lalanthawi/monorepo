// components/manager/ReportsView.jsx
import React, { useState, useEffect } from "react";
import ReportModal from "./ReportModal";

const ReportsView = ({ onGenerateReport, stats }) => {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReportData, setModalReportData] = useState(null);
  const [modalReportType, setModalReportType] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('today');

  const reports = [
    {
      id: "user_performance",
      icon: "👥",
      title: "Team Performance",
      description: "Individual and team productivity metrics",
      color: "blue",
      category: "performance",
      features: ["Task completion rates", "Individual metrics", "Workload distribution"]
    },
    {
      id: "daily_stats",
      icon: "📊",
      title: "Daily Statistics",
      description: "Today's tasks, completions, and electrician activity",
      color: "green",
      category: "operations",
      features: ["Real-time data", "Task breakdown", "Hourly trends"]
    }
  ];

  const handleGenerateReport = async (reportType) => {
    setLoading(true);
    setActiveReport(reportType);
    try {
      const result = await onGenerateReport(reportType);
      console.log('Report generated:', result);
      console.log('Report data:', result.data);
      console.log('ReportsView - Report generated:', reportType, result);
      setGeneratedReport({ type: reportType, data: result.data });
      
      // Process data for modal
      const processedData = processReportData(reportType, result.data);
      console.log('ReportsView - Processed data for modal:', processedData);
      
      // Ensure data is set before opening modal
      if (processedData) {
        console.log('Setting modal data:', processedData);
        console.log('Setting modal type:', reportType);
        setModalReportData(processedData);
        setModalReportType(reportType);
        // Small delay to ensure state is updated
        setTimeout(() => {
          console.log('Opening modal with data:', processedData);
          setIsModalOpen(true);
        }, 50);
      } else {
        console.error('No processed data available for modal');
      }
    } catch (error) {
      console.error('ReportsView - Error generating report:', error);
      alert(error.message);
      setGeneratedReport(null);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (type, data) => {
    console.log('processReportData - type:', type, 'data:', data);
    console.log('processReportData - data keys:', data ? Object.keys(data) : 'null');
    console.log('processReportData - data.analytics:', data?.analytics);
    
    if (type === 'user_performance') {
      const performance = data.performance || [];
      const summary = data.summary || {};
      console.log('processReportData - performance:', performance);
      console.log('processReportData - summary:', summary);
      
      const workloadDistribution = performance.map(user => ({
        name: user.full_name,
        taskCount: user.total_tasks || 0
      }));

      return {
        teamSummary: {
          totalElectricians: summary.total_electricians || performance.length,
          totalTasksHandled: summary.total_tasks_assigned || 0,
          totalCompleted: summary.total_completed || 0,
          overallCompletionRate: summary.total_tasks_assigned > 0 
            ? (summary.total_completed / summary.total_tasks_assigned) * 100 
            : 0,
          period_start: summary.period_start,
          period_end: summary.period_end,
          report_period: summary.report_period
        },
        workloadDistribution
      };
    }
    
    if (type === 'daily_stats') {
      const summary = data.summary || {};
      const tasksByStatus = data.tasks_by_status || [];
      const electricianActivity = data.electrician_activity || [];
      const hourlyDistribution = data.hourly_distribution || [];
      
      return {
        summary: {
          date: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          totalTasks: summary.total_tasks || 0,
          completedTasks: summary.completed_tasks || 0,
          inProgressTasks: summary.in_progress_tasks || 0,
          pendingTasks: summary.pending_tasks || 0,
          activeElectricians: summary.active_electricians || 0,
          completionRate: summary.total_tasks > 0 
            ? ((summary.completed_tasks / summary.total_tasks) * 100).toFixed(1) 
            : 0
        },
        tasksByStatus,
        electricianActivity: electricianActivity.map(e => ({
          name: e.electrician_name,
          tasksCompleted: e.tasks_completed || 0,
          tasksInProgress: e.tasks_in_progress || 0,
          totalTasks: e.total_tasks || 0
        })),
        hourlyDistribution
      };
    }
    
    console.error('processReportData - Unknown report type:', type);
    return null;
  };


  return (
    <div className="minimal-reports-view">
      {/* Header Section */}
      <div className="minimal-reports-header">
        <h2>Reports & Analytics</h2>
        <p>Generate team performance and daily statistics reports</p>
      </div>

      {/* Reports Grid */}
      <div className="minimal-reports-grid">
        {reports.map((report) => (
          <div key={report.id} className="minimal-report-card">
            <div className="minimal-card-header">
              <div className="minimal-icon">{report.icon}</div>
              <div className="minimal-title-section">
                <h3>{report.title}</h3>
                <p>{report.description}</p>
              </div>
            </div>
            <div className="minimal-features">
              {report.features.map((feature, index) => (
                <span key={index} className="minimal-feature-tag">
                  {feature}
                </span>
              ))}
            </div>
            <button
              className="minimal-generate-btn"
              onClick={() => handleGenerateReport(report.id)}
              disabled={loading && activeReport === report.id}
            >
              {loading && activeReport === report.id ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <span>📊</span>
                  Generate Report
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          console.log('Modal closed');
        }}
        reportType={modalReportType === 'user_performance' ? 'team_performance' : modalReportType}
        reportData={modalReportData}
      />
    </div>
  );
};

export default ReportsView;
