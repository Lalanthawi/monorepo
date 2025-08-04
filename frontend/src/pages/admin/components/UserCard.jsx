// components/UserCard.jsx
const UserCard = ({ user, onUserAction }) => {
  return (
    <div className="user-card">
      <div className="user-header">
        <div className="user-avatar">
          {user.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="user-status">
          <span className={`status ${user.status.toLowerCase()}`}>
            {user.status}
          </span>
        </div>
      </div>

      <div className="user-info">
        <h3>{user.full_name}</h3>
        <p className="user-role">{user.role}</p>
        <p className="user-email">📧 {user.email}</p>
        <p className="user-phone">📱 {user.phone || "N/A"}</p>
        <p className="user-date">
          📅 Joined: {new Date(user.created_at).toLocaleDateString()}
        </p>
        {user.employee_code && (
          <p className="user-code">🆔 Code: {user.employee_code}</p>
        )}
      </div>

      <div className="user-actions">
        <button onClick={() => onUserAction(user.id, "edit")}>Edit</button>
        <button onClick={() => onUserAction(user.id, "toggle")}>
          {user.status === "Active" ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => onUserAction(user.id, "resetPassword")}
          className="btn-warning"
        >
          Reset Password
        </button>
        <button
          className="btn-danger"
          onClick={() => onUserAction(user.id, "delete")}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserCard;
