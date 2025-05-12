import PromotionalEmails from './components/PromotionalEmails';

export default function Notifications() {
  return <div className="dashboard-card">
    <h2>System Notification Management</h2>
    <p>Create, schedule, and manage global notifications for users.</p>
    <div style={{ marginTop: '2rem' }}>
      <PromotionalEmails />
    </div>
    {/* Notification creation and list will go here */}
  </div>;
} 