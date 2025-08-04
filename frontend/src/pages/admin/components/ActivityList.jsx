const ActivityList = ({ activities }) => {
  return (
    <div className="activity-section">
      <h2>Recent Activity</h2>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">{activity.icon}</div>
            <div className="activity-content">
              <p>
                <strong>{activity.user}</strong> {activity.action}
              </p>
              <span className="activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityList;
