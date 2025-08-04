import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IssuesView.css';

const IssuesView = () => {
  console.log('IssuesView component is rendering!');
  
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    startDate: '',
    endDate: ''
  });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch issues based on filters
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      console.log('Fetching issues with params:', params.toString());
      const response = await axios.get(`/api/issues?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Issues response:', response.data);
      const issuesData = response.data.issues || [];
      console.log('Setting issues array:', issuesData);
      console.log('Issues count:', issuesData.length);
      setIssues(issuesData);
    } catch (error) {
      console.error('Error fetching issues:', error);
      console.error('Error details:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert('Access denied. Only managers can view all issues.');
      } else {
        alert('Failed to fetch issues: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch issue details
  const fetchIssueDetails = async (issueId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/issues/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSelectedIssue(response.data.issue);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching issue details:', error);
      alert('Failed to fetch issue details');
    }
  };

  // Update issue status
  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      let resolutionNotes = '';
      if (newStatus === 'resolved') {
        resolutionNotes = prompt('Please provide resolution notes:');
        if (!resolutionNotes) return;
      }

      await axios.patch(
        `/api/issues/${issueId}/status`,
        { 
          status: newStatus,
          resolution_notes: resolutionNotes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Issue ${newStatus === 'resolved' ? 'resolved' : 'updated'} successfully`);
      setShowDetailModal(false);
      fetchIssues(); // Refresh the list
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert('Failed to update issue status');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    console.log('IssuesView mounted, fetching issues...');
    fetchIssues();
  }, []);
  
  useEffect(() => {
    console.log('Filters changed, fetching issues with new filters:', filters);
    fetchIssues();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      startDate: '',
      endDate: ''
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'emergency': return 'priority-emergency';
      case 'urgent': return 'priority-urgent';
      case 'normal': return 'priority-normal';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in_progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="issues-view">
      <div className="issues-header">
        <h2>Reported Issues</h2>
        <div className="issues-summary">
          <span className="summary-item">
            Total: <strong>{issues.length}</strong>
          </span>
          <span className="summary-item">
            Open: <strong className="text-danger">{issues.filter(i => i.status === 'open').length}</strong>
          </span>
          <span className="summary-item">
            In Progress: <strong className="text-warning">{issues.filter(i => i.status === 'in_progress').length}</strong>
          </span>
          <span className="summary-item">
            Resolved: <strong className="text-success">{issues.filter(i => i.status === 'resolved').length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="issues-filters">
        <div className="filter-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Priority</label>
          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priorities</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>

        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Issues Table */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">Loading issues...</div>
        </div>
      ) : issues.length === 0 ? (
        <div className="no-issues">
          <p>No issues found matching the selected filters.</p>
        </div>
      ) : (
        <div className="issues-table-container">
          <table className="issues-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Reported By</th>
                <th>Issue Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue.id}>
                  <td>#{issue.id}</td>
                  <td>
                    <div className="task-info">
                      <span className="task-code">{issue.task_code}</span>
                      <span className="task-title">{issue.task_title}</span>
                    </div>
                  </td>
                  <td>{issue.reported_by_name}</td>
                  <td className="issue-type">{issue.issue_type?.replace(/_/g, ' ')}</td>
                  <td>
                    <span className={`priority-badge ${getPriorityClass(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(issue.status)}`}>
                      {issue.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{formatDate(issue.created_at)}</td>
                  <td>
                    <button
                      className="action-btn view-btn"
                      onClick={() => fetchIssueDetails(issue.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Clean Issue Detail Modal */}
      {showDetailModal && selectedIssue && (
        <div className="modern-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modern-issue-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="modern-modal-header">
              <div className="header-main">
                <h2>Issue #{selectedIssue.id}</h2>
                <span className={`modern-status-badge ${getStatusClass(selectedIssue.status)}`}>
                  {selectedIssue.status.replace(/_/g, ' ')}
                </span>
              </div>
              <button className="modern-close-btn" onClick={() => setShowDetailModal(false)}>
                ×
              </button>
            </div>

            {/* Content */}
            <div className="modern-modal-content">
              
              {/* Issue Overview */}
              <div className="modern-section">
                <div className="modern-section-grid">
                  <div className="modern-field">
                    <label>Type</label>
                    <span>{selectedIssue.issue_type?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="modern-field">
                    <label>Priority</label>
                    <span className={`modern-priority-badge ${getPriorityClass(selectedIssue.priority)}`}>
                      {selectedIssue.priority}
                    </span>
                  </div>
                  <div className="modern-field">
                    <label>Reported by</label>
                    <span>{selectedIssue.reported_by_name}</span>
                  </div>
                  <div className="modern-field">
                    <label>Date</label>
                    <span>{formatDate(selectedIssue.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="modern-section">
                <h3>Description</h3>
                <div className="modern-text-content">
                  {selectedIssue.description}
                </div>
              </div>

              {/* Requested Action */}
              {selectedIssue.requested_action && (
                <div className="modern-section">
                  <h3>Requested Action</h3>
                  <div className="modern-text-content">
                    {selectedIssue.requested_action}
                  </div>
                </div>
              )}

              {/* Task Information */}
              <div className="modern-section">
                <h3>Related Task</h3>
                <div className="modern-task-card">
                  <div className="task-header-simple">
                    <span className="task-code-badge">{selectedIssue.task_code}</span>
                    <span className="task-title">{selectedIssue.task_title}</span>
                  </div>
                  <div className="task-details-simple">
                    <div className="task-detail-item">
                      <strong>Customer:</strong> {selectedIssue.customer_name}
                    </div>
                    <div className="task-detail-item">
                      <strong>Phone:</strong> {selectedIssue.customer_phone}
                    </div>
                    <div className="task-detail-item">
                      <strong>Address:</strong> {selectedIssue.customer_address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution */}
              {selectedIssue.resolution_notes && (
                <div className="modern-section">
                  <h3>Resolution</h3>
                  <div className="modern-text-content modern-resolution">
                    {selectedIssue.resolution_notes}
                  </div>
                  {selectedIssue.resolved_at && (
                    <div className="resolution-meta">
                      Resolved by {selectedIssue.resolved_by_name} on {formatDate(selectedIssue.resolved_at)}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Actions */}
            {selectedIssue.status !== 'resolved' && (
              <div className="modern-modal-actions">
                {selectedIssue.status === 'open' && (
                  <button
                    className="modern-btn modern-btn-secondary"
                    onClick={() => updateIssueStatus(selectedIssue.id, 'in_progress')}
                    disabled={actionLoading}
                  >
                    Start Working
                  </button>
                )}
                <button
                  className="modern-btn modern-btn-primary"
                  onClick={() => updateIssueStatus(selectedIssue.id, 'resolved')}
                  disabled={actionLoading}
                >
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesView;