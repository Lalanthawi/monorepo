// components/UserManagement.jsx
import { usersService } from "../../../services/users";
import UserCard from "./UserCard";

const UserManagement = ({
  users,
  setModalType,
  setShowModal,
  setFormData,
  setSelectedItem,
  setResetPasswordData,
  loadDashboardData,
}) => {
  // Generate employee code
  const generateEmployeeCode = (role) => {
    const prefix =
      role === "Electrician" ? "ELC" : role === "Manager" ? "MGR" : "ADM";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNum}`;
  };

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
      certifications: [],
    });
    setModalType("addUser");
    setShowModal(true);
  };

  // Handle user actions
  const handleUserAction = async (userId, action) => {
    try {
      if (action === "toggle") {
        const response = await usersService.toggleStatus(userId);
        if (response.success) {
          await loadDashboardData();
        }
      } else if (action === "delete") {
        if (
          confirm(
            "Are you sure you want to delete this user? This action cannot be undone."
          )
        ) {
          const response = await usersService.delete(userId);
          if (response.success) {
            alert("User deleted successfully!");
            await loadDashboardData();
          }
        }
      } else if (action === "edit") {
        const user = users.find((u) => u.id === userId);
        setSelectedItem(user);
        setFormData({
          ...user,
          skills: user.skills ? user.skills.split(", ") : [],
          certifications: user.certifications ? user.certifications.split(", ") : [],
          password: "",
        });
        setModalType("editUser");
        setShowModal(true);
      } else if (action === "resetPassword") {
        setResetPasswordData({
          userId: userId,
          newPassword: "",
          confirmPassword: "",
        });
        setModalType("resetPassword");
        setShowModal(true);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="users-section">
      <div className="section-header">
        <h2>User Management</h2>
        <button className="btn-primary" onClick={handleAddNewUser}>
          ➕ Add New User
        </button>
      </div>

      <div className="users-grid">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onUserAction={handleUserAction} />
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
