// ViewReportModal.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ViewReport.module.css'; // New styles for modal
import modalStyles from './ReportModal.module.css'; // Generic modal styles

const ViewReportModal = ({ reportId, onClose }) => {
  const [report, setReport] = useState(null);
  const [suspension, setSuspension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suspensionLoading, setSuspensionLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/report/getReport/${reportId}`);
        setReport(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching report:', error);
        setLoading(false);
      }
    };

    const fetchSuspension = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/suspension/getSuspensionByReport/${reportId}`);
        setSuspension(response.data);
        setSuspensionLoading(false);
      } catch (error) {
        console.error('Error fetching suspension:', error);
        setSuspensionLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
      fetchSuspension();
    }
  }, [reportId]);

  if (loading) {
    return <div class="dot-spinner">
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
    </div>
  }

  if (!report) {
    return <p>Report not found.</p>;
  }

  return (
    <div className={modalStyles['report-modal-overlay']}>
      <div className={modalStyles['report-view-modal-content']}>
        <button className={modalStyles.closeButton} onClick={onClose}>✕</button>
        <div className={styles.tablesContainer}>
          {/* Report Details */}
          <div className={styles.tableWrapper}>
            <h2>Report Details</h2>
            <table className={styles['report-details']}>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Student:</td>
                  <td>{report.record.student.name}</td>
                </tr>
                <tr>
                  <td>Adviser:</td>
                  <td>{report.adviser.firstname} {report.adviser.lastname}</td>
                </tr>
                <tr>
                  <td>Date:</td>
                  <td>{report.date}</td>
                </tr>
                <tr>
                  <td>Time:</td>
                  <td>{report.time}</td>
                </tr>
                <tr>
                  <td>Received:</td>
                  <td>{report.received ? report.received : 'Pending'}</td>
                </tr>
                <tr>
                  <td>Complaint:</td>
                  <td>{report.complaint}</td>
                </tr>
                <tr>
                  <td>Complainant:</td>
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
                </tr>
                <tr>
                  <td>Complete:</td>
                  <td>{report.complete ? 'Yes' : 'No'}</td>
                </tr>
                {/* <tr>
                  <td>Viewed by Adviser:</td>
                  <td>{report.viewedByAdviser ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Viewed by SSO:</td>
                  <td>{report.viewedBySso ? 'Yes' : 'No'}</td>
                </tr> */}
              </tbody>
            </table>
          </div>
  
          {/* Display Suspension Details Table */}
          <div className={styles['tableWrapper-second']}>
            <h2>Suspension Details</h2>
            {suspensionLoading ? (
              <p>Loading suspension details...</p>
            ) : suspension ? (
              <table className={styles['suspension-details-table']}>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Date Submitted:</td>
                    <td>{suspension.dateSubmitted}</td>
                  </tr>
                  <tr>
                    <td>Days Suspended:</td>
                    <td>{suspension.days}</td>
                  </tr>
                  <tr>
                    <td>Start Date:</td>
                    <td>{suspension.startDate}</td>
                  </tr>
                  <tr>
                    <td>End Date:</td>
                    <td>{suspension.endDate}</td>
                  </tr>
                  <tr>
                    <td>Return Date:</td>
                    <td>{suspension.returnDate}</td>
                  </tr>
                  {/* <tr>
                    <td>Viewed by Principal:</td>
                    <td>{suspension.viewedByPrincipal ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <td>Viewed by Adviser:</td>
                    <td>{suspension.viewedByAdviser ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <td>Viewed by SSO:</td>
                    <td>{suspension.viewedBySso ? 'Yes' : 'No'}</td>
                  </tr> */}
                </tbody>
              </table>
            ) : (
              <p>No suspension details found for this report.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReportModal;
