// components/PasswordResetModal.jsx
import { usersService } from "../../../services/users";

const PasswordResetModal = ({
  resetPasswordData,
  setResetPasswordData,
  setShowModal,
}) => {
  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      const response = await usersService.resetPassword(
        resetPasswordData.userId,
        resetPasswordData.newPassword
      );

      if (response.success) {
        alert("Password reset successfully!");
        setShowModal(false);
        setResetPasswordData({
          userId: null,
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      alert("Error resetting password: " + error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reset User Password</h2>
          <button className="close-btn" onClick={() => setShowModal(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handlePasswordReset}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={resetPasswordData.newPassword}
              onChange={(e) =>
                setResetPasswordData({
                  ...resetPasswordData,
                  newPassword: e.target.value,
                })
              }
              required
              placeholder="Enter new password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={resetPasswordData.confirmPassword}
              onChange={(e) =>
                setResetPasswordData({
                  ...resetPasswordData,
                  confirmPassword: e.target.value,
                })
              }
              required
              placeholder="Confirm new password"
              minLength="6"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetModal;
