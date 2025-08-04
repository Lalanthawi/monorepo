const Header = ({ activeSection }) => {
  return (
    <header className="top-header">
      <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
      <div className="header-actions">
        <button className="notification-btn">
          🔔 <span className="badge">3</span>
        </button>
        <span className="current-time">{new Date().toLocaleString()}</span>
      </div>
    </header>
  );
};

export default Header;
