// components/StatsContainer.jsx
const StatsContainer = ({ stats }) => {
  return (
    <div className="stats-container">
      <div className="stat-box primary">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <h3>{stats.totalUsers || 0}</h3>
          <p>Total Users</p>
        </div>
      </div>

      <div className="stat-box info">
        <div className="stat-icon">⚡</div>
        <div className="stat-content">
          <h3>{stats.totalElectricians || 0}</h3>
          <p>Electricians</p>
        </div>
      </div>

      <div className="stat-box warning">
        <div className="stat-icon">👨‍💼</div>
        <div className="stat-content">
          <h3>{stats.totalManagers || 0}</h3>
          <p>Managers</p>
        </div>
      </div>

      <div className="stat-box success">
        <div className="stat-icon">👨‍💻</div>
        <div className="stat-content">
          <h3>{stats.totalAdmins || 0}</h3>
          <p>Admins</p>
        </div>
      </div>
    </div>
  );
};

export default StatsContainer;
