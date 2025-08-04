import React, { useState } from "react";
import ManagerSidebar from "./components/ManagerSidebar";
import "./ManagerDashboard.css";

const ManagerDashboardFixed = () => {
  const [activeView, setActiveView] = useState("overview");
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <div><h2>Overview</h2><p>Dashboard overview content here</p></div>;
      
      case "tasks":
        return <div><h2>Tasks</h2><p>Tasks management here</p></div>;
      
      case "team":
        return <div><h2>Team</h2><p>Team management here</p></div>;
      
      case "issues":
        return (
          <div>
            <h2>Issues</h2>
            <p>Issues are now visible! The state update is working.</p>
          </div>
        );
      
      case "reports":
        return <div><h2>Reports</h2><p>Reports section here</p></div>;
      
      default:
        return <div>Unknown view</div>;
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
        userInfo={{ name: "Manager", email: "manager@company.com" }}
        onLogout={handleLogout}
        issuesCount={0}
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
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboardFixed;