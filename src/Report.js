import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import navStyles from './Navigation.module.css';
import tableStyles from './GlobalTable.module.css';
import Navigation from './Navigation';
import ReportModal from './ReportModal';
import ViewReportModal from './ViewReport'; // Import the modal
import EditReportModal from './EditReportModal';
import AddSuspensionModal from './SSO/AddSuspensionModal';
import styles from './Report.module.css';

const Reports = () => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = authToken ? JSON.parse(authToken) : null;
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [suspensions, setSuspensions] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showViewReportModal, setShowViewReportModal] = useState(false); // State for showing modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedReportStatus, setSelectedReportStatus] = useState({ completed: false, suspended: false });

  useEffect(() => {
    fetchReports();
    fetchSuspensions();
  }, []);

  useEffect(() => {
    if (!authToken) {
      navigate('/login');
    }
  
    // Mark reports as viewed based on user type
    const markReportsAsViewed = async () => {
      try {
        if (loggedInUser?.userType === 1) {
          // Mark as viewed for SSO
          await axios.post('http://localhost:8080/report/markAsViewedForSso');
        } else if (loggedInUser?.userType === 3) {
          // Mark as viewed for Adviser
          await axios.post('http://localhost:8080/report/markAsViewedForAdviser', {
            grade: loggedInUser.grade,
            section: loggedInUser.section,
            schoolYear: loggedInUser.schoolYear,
          });
        }
      } catch (error) {
        console.error('Error marking reports as viewed:', error);
      }
    };
  
    markReportsAsViewed();
  }, [authToken, loggedInUser, navigate]);
  

  const fetchSuspensions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/suspension/getAllSuspensions');
      setSuspensions(response.data);
    } catch (error) {
      console.error('Error fetching suspensions:', error);
      alert('Failed to fetch suspensions. Please try again later.');
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      let response;
  
      if (loggedInUser?.userType === 3) {
        response = await axios.get('http://localhost:8080/report/getAllReportsForAdviser', {
          params: {
            grade: loggedInUser.grade,
            section: loggedInUser.section,
            schoolYear: loggedInUser.schoolYear,
            complainant: loggedInUser.username,
          },
        });
      } else if (loggedInUser?.userType === 2 || loggedInUser?.userType === 5 || loggedInUser?.userType === 6) {
        response = await axios.get('http://localhost:8080/report/getAllReportsByComplainant', {
          params: {
            complainant: loggedInUser.username,
          },
        });
      } else {
        response = await axios.get('http://localhost:8080/report/getAllReports');
      }
  
      let fetchedReports = response.data;
  
      if (loggedInUser?.userType === 1) {
        const currentDate = new Date().toISOString().split('T')[0];
        const updates = fetchedReports
          .filter((report) => !report.received)
          .map((report) =>
            axios.put(`http://localhost:8080/report/updateReceived/${report.reportId}`, { received: currentDate })
          );
  
        await Promise.all(updates);
        const updatedResponse = await axios.get('http://localhost:8080/report/getAllReports');
        fetchedReports = updatedResponse.data;
      }
  
      // Sort reports by reportId in descending order
      fetchedReports.sort((a, b) => b.reportId - a.reportId);
  
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to fetch reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  const isReportSuspended = (reportId) => {
    return suspensions.some((suspension) => suspension.reportId === reportId);
  };

  const handleComplete = async (reportId) => {
    try {
      await axios.put(`http://localhost:8080/report/complete/${reportId}`);
      fetchReports(); 
    } catch (error) {
      console.error('Error completing the report:', error);
      alert('Failed to complete the report.');
    }
  };

  const handleAddSuspension = (reportId) => {
    setSelectedReportId(reportId);
    setShowSuspensionModal(true);
  };

  const toggleReportModal = () => {
    setShowReportModal(!showReportModal);
  };

  const toggleSuspensionModal = () => {
    setShowSuspensionModal(!showSuspensionModal);
    setSelectedReportId(null);
  };

  const handleRowClick = (report) => {
    setSelectedReportId(report.reportId);
    setSelectedReportStatus({
      completed: report.complete,
      suspended: isReportSuspended(report.reportId)
    });
  };

  const handleEdit = (reportId) => {
    setSelectedReportId(reportId);
    setShowEditModal(true);
  };

  const handleViewReport = (reportId) => {
    setSelectedReportId(reportId);
    setShowViewReportModal(true); // Show the modal
  };

  const closeViewReportModal = () => {
    setShowViewReportModal(false); // Close modal
    setSelectedReportId(null);
  };

  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />

      <div className={navStyles.content}>
        <div className={navStyles.TitleContainer}>
          <h2 className={navStyles['h1-title']}>Reports List</h2>
        </div>
        {loading ? (
          <div class="dot-spinner">
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
          </div>
        ) : (
          <div className={tableStyles['table-container']}>
            <table className={tableStyles['global-table']}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Monitored Record</th>
                  <th>Complainant</th>
                  <th>Student</th>
                  <th>Adviser</th>
                  <th>Encoder</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr 
                    key={report.reportId} 
                    onClick={() => handleRowClick(report)}
                    className={selectedReportId === report.reportId ? tableStyles['selected-row'] : ''}
                  >
                    <td>{report.date}</td>
                    <td>{report.record.monitored_record}</td>
                    <td>
                      {report.ssoComplainant 
                        ? `${report.ssoComplainant.firstname} ${report.ssoComplainant.lastname}`
                        : report.principalComplainant
                        ? `${report.principalComplainant.firstname} ${report.principalComplainant.lastname}` 
                        : report.adviserComplainant 
                          ? `${report.adviserComplainant.firstname} ${report.adviserComplainant.lastname}` 
                          : report.teacherComplainant 
                            ? `${report.teacherComplainant.firstname} ${report.teacherComplainant.lastname}` 
                            : report.guidanceComplainant 
                              ? `${report.guidanceComplainant.firstname} ${report.guidanceComplainant.lastname}` 
                              : 'N/A'} {/* Display 'N/A' if no complainant is found */}
                    </td>
                    <td>{report.record.student.name}</td>
                    <td>{report.adviser.firstname} {report.adviser.lastname}</td>
                    <td>{report.encoder}</td>
                    <td>{report.received ? report.received : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        <div className={styles.actionButtons}>
          <button className={`${styles['report-action-button']} ${styles['report-create-btn']}`} onClick={toggleReportModal}>
            Create 
          </button>
          <button 
            className={`${styles['report-action-button']} ${styles['report-view-btn']}`} 
            onClick={() => handleViewReport(selectedReportId)} 
            disabled={!selectedReportId} 
          >
            View
          </button>

          {loggedInUser?.userType === 1 && (
            <>
              <button
                className={`${styles['report-action-button']} ${styles['report-edit-btn']}`}
                onClick={() => handleEdit(selectedReportId)}
                disabled={!selectedReportId}
              >
                Edit 
              </button>
              <button
                className={styles['report-action-button']}
                onClick={() => handleComplete(selectedReportId)}
                disabled={!selectedReportId || selectedReportStatus.completed}
              >
                Complete
              </button>
              <button
                className={`${styles['report-action-button']} ${styles['report-suspension-btn']}`}
                onClick={() => handleAddSuspension(selectedReportId)}
                disabled={!selectedReportId || selectedReportStatus.suspended || selectedReportStatus.completed}
              >
                {selectedReportStatus.suspended ? 'Suspended' : 'Add Suspension'}
              </button>
            </>
          )}
        </div>

        {showReportModal && (
          <ReportModal
            key="addReportModal"
            onClose={toggleReportModal}
            refreshReports={fetchReports}
          />
        )}

        {showSuspensionModal && (
          <AddSuspensionModal
            key="addSuspensionModal"
            onClose={toggleSuspensionModal}
            reportId={selectedReportId}
            refreshReports={fetchReports}
            refreshSuspensions={fetchSuspensions} 
          />
        )}

        {/* View Report Modal */}
        {showViewReportModal && (
          <ViewReportModal
            reportId={selectedReportId}
            onClose={closeViewReportModal}
          />
        )}        

        {showEditModal && (
          <EditReportModal
            reportId={selectedReportId}
            onClose={() => setShowEditModal(false)}
            refreshReports={fetchReports}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;
