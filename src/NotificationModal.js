import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './NotificationModal.module.css';
import ViewReport from './ViewReport'; // Import ViewReport component

const NotificationModal = ({ onClose, loggedInUser, reports, suspensions, refreshNotifications }) => {
  const navigate = useNavigate();
  const [showViewReportModal, setShowViewReportModal] = useState(false); // State to control the ViewReport modal
  const [selectedReportId, setSelectedReportId] = useState(null); // State to store the selected report ID

  // Automatically mark notifications as viewed when modal opens
  useEffect(() => {
    const markNotificationsAsViewed = async () => {
      try {
        // Logic to update "received" status for userType === 1
        if (loggedInUser?.userType === 1) {
          await axios.post('http://localhost:8080/report/markAsViewedForSso');
          await axios.post('http://localhost:8080/suspension/markAsViewedForSso');
          
          const response = await axios.get('http://localhost:8080/report/getAllReports'); // Fetch all reports
          const currentDate = new Date().toISOString().split('T')[0];

          const updates = response.data
            .filter(report => !report.received) // Filter unreceived reports
            .map(report => axios.put(`http://localhost:8080/report/updateReceived/${report.reportId}`, { received: currentDate }));

          await Promise.all(updates); // Update all unreceived reports
        } else if (loggedInUser?.userType === 2) {
          await axios.post('http://localhost:8080/suspension/markAsViewedForPrincipal');
        } else if (loggedInUser?.userType === 3) {
          await axios.post('http://localhost:8080/report/markAsViewedForAdviser', null, {
            params: {
              grade: loggedInUser.grade,
              section: loggedInUser.section,
              schoolYear: loggedInUser.schoolYear,
            },
          });
          await axios.post('http://localhost:8080/suspension/markAsViewedForAdviser', null, {
            params: {
              grade: loggedInUser.grade,
              section: loggedInUser.section,
              schoolYear: loggedInUser.schoolYear,
            },
          });
        } else if (loggedInUser?.userType === 5 || loggedInUser?.userType === 6) {
          await axios.post('http://localhost:8080/suspension/markAsViewedForComplainant', null, {
            params: {
              username: loggedInUser.username,
            },
          });
        }
        refreshNotifications();
      } catch (error) {
        console.error('Error marking notifications as viewed:', error);
      }
    };

    markNotificationsAsViewed();
  }, [loggedInUser, refreshNotifications]);

  // Handle viewing a report in modal
  const handleViewReport = (reportId) => {
    setSelectedReportId(reportId);
    setShowViewReportModal(true); // Show the ViewReport modal
  };

  const closeViewReportModal = () => {
    setShowViewReportModal(false);
    setSelectedReportId(null); // Clear the selected report ID
  };

  return (
    <div className={styles['notification-modal-overlay']}>
      <div className={styles['notification-modal-content']}>
        <button className={styles['notification-close-button']} onClick={onClose}>
          ✕
        </button>
        <h2 className={styles['notification-modal-title']}>Your Notifications</h2>

        {(loggedInUser?.userType === 1 || loggedInUser?.userType === 3) && (
        <>
        <h3 className={styles['notification-modal-section-title']}>New Reports</h3>
        {reports.length > 0 ? (
          <ul className={styles['notification-modal-list']}>
            {reports
              .filter(report => report.complainant !== loggedInUser?.username)
              .sort((a, b) => b.reportId - a.reportId) // Sort reports in descending order by reportId
              .map((report) => (
                <li
                  key={report.reportId}
                  className={`${styles['notification-modal-list-item']} ${styles['clickable']}`}
                  onClick={() => handleViewReport(report.reportId)}
                >
                  <strong>{report.record.student.name}</strong> from <strong>{report.record.student.grade} - {report.record.student.section}</strong> has a report concerning a recent incident. <br />
                  <small>Click to view details.</small>
                </li>
              ))}
          </ul>
        ) : (
          <p className={styles['notification-modal-empty-message']}>You have no new reports at the moment.</p>
        )}
         </>
         )}

        {loggedInUser?.userType !== 1 && (
          <>
            <h3 className={styles['notification-modal-section-title']}>Recent Suspensions</h3>
            {suspensions.length > 0 ? (
              <ul className={styles['notification-modal-list']}>
                {suspensions
                  .sort((a, b) => b.suspensionId - a.suspensionId) // Sort suspensions in descending order by suspensionId
                  .map((suspension) => (
                    <li
                      key={suspension.suspensionId}
                      className={`${styles['notification-modal-list-item']} ${styles['clickable']}`}
                      onClick={() => handleViewReport(suspension.reportEntity.reportId)}
                    >
                      <strong>{suspension.reportEntity.record.student.name}</strong> has been suspended. 
                      <br />
                      <small>Click to view details.</small>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className={styles['notification-modal-empty-message']}>No suspensions recorded at this time.</p>
            )}
          </>
        )}
      </div>

      {/* ViewReport Modal */}
      {showViewReportModal && selectedReportId && (
        <ViewReport
          reportId={selectedReportId}
          onClose={closeViewReportModal}
        />
      )}
    </div>
  );
};

export default NotificationModal;
