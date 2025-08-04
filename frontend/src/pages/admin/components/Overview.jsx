// components/Overview.jsx
import StatsContainer from "./StatsContainer";
import QuickActions from "./QuickActions";
import ActivityList from "./ActivityList";

const Overview = ({
  stats,
  activities,
  setModalType,
  setShowModal,
  setFormData,
  setActiveSection,
  loadDashboardData,
}) => {
  // Generate employee code
  const generateEmployeeCode = (role) => {
    const prefix =
      role === "Electrician" ? "ELC" : role === "Manager" ? "MGR" : "ADM";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNum}`;
  };

  return (
    <>
      {/* Stats Overview */}
      <StatsContainer stats={stats} />

      {/* Quick Actions */}
      <QuickActions
        setModalType={setModalType}
        setShowModal={setShowModal}
        setFormData={setFormData}
        setActiveSection={setActiveSection}
        generateEmployeeCode={generateEmployeeCode}
      />

      {/* Recent Activity */}
      <ActivityList activities={activities} />
    </>
  );
};

export default Overview;
