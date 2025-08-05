// components/Sidebar.jsx
const Sidebar = ({ activeSection, setActiveSection, handleLogout, currentUser }) => {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon">⚡</span>
        <h2>Admin Panel</h2>
      </div>

      <nav className="nav-menu">
        <button
          className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
          onClick={() => setActiveSection("overview")}
        >
          <span>🏠</span> Dashboard
        </button>

        <button
          className={`nav-item ${activeSection === "users" ? "active" : ""}`}
          onClick={() => setActiveSection("users")}
        >
          <span>👥</span> Users
        </button>

        <button
          className={`nav-item ${activeSection === "reports" ? "active" : ""}`}
          onClick={() => setActiveSection("reports")}
        >
          <span>📊</span> Reports
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="admin-info">
          <div className="admin-avatar">
            {currentUser?.full_name 
              ? currentUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
              : 'AD'}
          </div>
          <div>
            <p className="admin-name">{currentUser?.full_name || 'Admin User'}</p>
            <p className="admin-email">{currentUser?.email || 'admin@company.com'}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
