import React, { useState, useEffect } from "react";
import { useManagerData } from "./hooks/useManagerData.js";
import ManagerSidebar from "./components/ManagerSidebar";
import StatsCards from "./components/StatsCards";
import TaskManagementView from "./components/TaskManagementView";
import TeamView from "./components/TeamView";
import ReportsView from "./components/ReportsView";
import IssuesView from "./components/IssuesView";
import RecentTasks from "./components/RecentTasks";
import CreateTaskModal from "./components/modals/CreateTaskModal";
import AssignTaskModal from "./components/modals/AssignTaskModal";
import ViewTaskModal from "./components/modals/ViewTaskModal";
import EditTaskModal from "./components/modals/EditTaskModal";
import ViewProfileModal from "./components/modals/ViewProfileModal";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const [activeView, setActiveView] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedElectrician, setSelectedElectrician] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const {
    loading,
    error,
    stats,
    tasks,
    filteredTasks,
    electricians,
    activities,
    activeFilter,
    userInfo,
    filterTasks,
    createTask,
    assignTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    getTaskById,
    generateReport,
  } = useManagerData();

  const openModal = (type, data = null) => {
    setModalType(type);
    if (type === "assignTask") {
      setSelectedTask(data);
    } else if (type === "assignToElectrician") {
      setSelectedElectrician(data);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedTask(null);
    setSelectedElectrician(null);
  };

  const handleCreateTask = async (taskData) => {
    const result = await createTask(taskData);
    if (result.success) {
      alert(result.message);
    }
  };

  const handleAssignTask = async (taskId, electricianId) => {
    const result = await assignTask(taskId, electricianId);
    if (result.success) {
      alert(result.message);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    const result = await updateTask(taskId, taskData);
    if (result.success) {
      alert(result.message);
    }
  };

  const handleViewTask = async (task) => {
    try {
      // Fetch detailed task data with completion information
      const result = await getTaskById(task.id);
      if (result.success) {
        setSelectedTask(result.data);
        openModal("viewTask");
      } else {
        // Fallback to basic task data if detailed fetch fails
        setSelectedTask(task);
        openModal("viewTask");
      }
    } catch (error) {
      console.error("Failed to fetch task details:", error);
      // Fallback to basic task data
      setSelectedTask(task);
      openModal("viewTask");
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setModalType("editTask");
    setShowModal(true);
  };

  const handleDeleteTask = async (task) => {
    // Check if task can be deleted
    if (task.status === "Completed") {
      alert("Cannot delete completed tasks.");
      return;
    }
    
    const confirmDelete = confirm(
      `Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        const result = await deleteTask(task.id);
        if (result.success) {
          alert(result.message);
        }
      } catch (error) {
        console.error("Delete task error:", error);
        
        // Provide more specific error messages
        let errorMessage = "Failed to delete task";
        if (error.message.includes("Cannot delete completed tasks")) {
          errorMessage = "Cannot delete completed tasks";
        } else if (error.message.includes("permission")) {
          errorMessage = "You don't have permission to delete this task";
        } else if (error.message.includes("not found")) {
          errorMessage = "Task not found";
        } else {
          errorMessage = error.message || "An unexpected error occurred while deleting the task";
        }
        
        alert("Error: " + errorMessage);
      }
    }
  };

  const handleViewProfile = (electrician) => {
    setSelectedElectrician(electrician);
    setShowProfileModal(true);
  };
  
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  const renderContent = () => {
    if (loading && !tasks.length && activeView === "overview") {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      );
    }

    switch (activeView) {
      case "overview":
        return (
          <div className="overview-content">
            <StatsCards stats={stats} />
            <div className="overview-sections">
              <div className="quick-actions-section">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button
                    className="action-btn primary"
                    onClick={() => openModal("createTask")}
                  >
                    <i className="fas fa-plus"></i>
                    Create New Task
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => setActiveView("tasks")}
                  >
                    <i className="fas fa-list"></i>
                    View All Tasks
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => setActiveView("team")}
                  >
                    <i className="fas fa-users"></i>
                    Manage Team
                  </button>
                </div>
              </div>
              <div className="recent-tasks-section">
                <RecentTasks tasks={tasks} onViewTask={handleViewTask} />
              </div>
            </div>
          </div>
        );

      case "tasks":
        return (
          <TaskManagementView
            tasks={tasks}
            filteredTasks={filteredTasks}
            activeFilter={activeFilter}
            onFilterChange={filterTasks}
            onCreateTask={() => openModal("createTask")}
            onAssignTask={(task) => openModal("assignTask", task)}
            onViewTask={handleViewTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        );

      case "team":
        return (
          <TeamView
            electricians={electricians}
            onViewProfile={handleViewProfile}
          />
        );

      case "issues":
        return <IssuesView />;

      case "reports":
        return <ReportsView onGenerateReport={generateReport} stats={stats} />;

      default:
        return null;
    }
  };

  return (
    <div className="manager-dashboard">
      <ManagerSidebar
        activeView={activeView}
        onViewChange={(view) => {
          console.log('Setting view to:', view);
          setActiveView(view);
        }}
        userInfo={userInfo}
        onLogout={handleLogout}
        issuesCount={stats.openIssues}
      />

      <main className="main-content">
        <header className="top-header">
          <div>
            <h1>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
            <p className="date-time">
              {new Date().toLocaleDateString()} • Kandy Branch
            </p>
          </div>
        </header>

        <div className="content-wrapper">
          {error && <div className="error-message">{error}</div>}
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      {showModal && modalType === "createTask" && (
        <CreateTaskModal onClose={closeModal} onCreate={handleCreateTask} />
      )}

      {showModal && modalType === "assignTask" && selectedTask && (
        <AssignTaskModal
          task={selectedTask}
          electricians={electricians}
          onClose={closeModal}
          onAssign={handleAssignTask}
        />
      )}

      {showModal && modalType === "viewTask" && selectedTask && (
        <ViewTaskModal
          task={selectedTask}
          onClose={closeModal}
          onEdit={handleEditTask}
        />
      )}

      {showModal && modalType === "editTask" && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={closeModal}
          onUpdate={handleUpdateTask}
        />
      )}

      {showProfileModal && selectedElectrician && (
        <ViewProfileModal
          electrician={selectedElectrician}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedElectrician(null);
          }}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;