// components/QuickActions.jsx
const QuickActions = ({
  setModalType,
  setShowModal,
  setFormData,
  setActiveSection,
  generateEmployeeCode,
}) => {
  // Handle add new user
  const handleAddNewUser = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      full_name: "",
      phone: "",
      role: "Electrician",
      employee_code: generateEmployeeCode("Electrician"),
      skills: [],
      certifications: "",
    });
    setModalType("addUser");
    setShowModal(true);
  };

  return (
    <div className="quick-actions">
      <h2>Quick Actions</h2>
      <div className="action-buttons">
        <button onClick={handleAddNewUser}>➕ Add New User</button>
        <button onClick={() => setActiveSection("users")}>
          👥 Manage Users
        </button>
        <button onClick={() => setActiveSection("reports")}>
          📈 View Reports
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
