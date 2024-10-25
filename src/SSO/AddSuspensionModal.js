import React, { useState } from 'react';
import axios from 'axios';
import styles from '../ReportModal.module.css'; // Importing the CSS file

const AddSuspensionModal = ({ onClose, reportId, refreshReports, refreshSuspensions }) => {
  const authToken = localStorage.getItem("authToken");
  const loggedInUser = authToken ? JSON.parse(authToken) : null;
  const [suspensionData, setSuspensionData] = useState({
    days: '',
    startDate: '',
    endDate: '',
    returnDate: ''
  });

  // Handle input changes for the form
  // Handle input changes for the form
const handleInputChange = (e) => {
  const { name, value } = e.target;

  // Ensure that 'days' is a positive integer
  if (name === "days" && (value === "" || parseInt(value) >= 1)) {
    setSuspensionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  // For other fields like date, just update the state
  if (name !== "days") {
    setSuspensionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
};


  // Handle adding suspension
  const handleCreateSuspension = async () => {
    try {
      const suspensionPayload = {
        ...suspensionData,
        reportId, // Use the reportId passed as a prop
        dateSubmitted: new Date().toISOString().split('T')[0], // Set the current date
        viewedBySso: loggedInUser.userType === 1,

      };

      await axios.post('http://localhost:8080/suspension/insertSuspension', suspensionPayload);
      
      refreshSuspensions(); // Call the suspension refresh function passed from parent
      refreshReports(); // Optionally refresh reports to reflect any report changes
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error('Error creating suspension:', error);
    }
  };

  return (
    <div className={styles['report-modal-overlay']}>
      <div className={styles['suspension-modal-content']}>
        <h2>Add Suspension</h2>

        <div className={styles['report-group']}>
          <label>Days of Suspension:</label>
          <input
            type="number"
            name="days"
            value={suspensionData.days}
            onChange={handleInputChange}
            className={styles['suspension-input']}
          />
        </div>

        <div className={styles['report-group']}>
          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={suspensionData.startDate}
            onChange={handleInputChange}
            className={styles['suspension-input']}
          />
        </div>

        <div className={styles['report-group']}>
          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={suspensionData.endDate}
            onChange={handleInputChange}
            className={styles['suspension-input']}
          />
        </div>

        <div className={styles['report-group']}>
          <label>Return Date:</label>
          <input
            type="date"
            name="returnDate"
            value={suspensionData.returnDate}
            onChange={handleInputChange}
            className={styles['suspension-input']}
          />
        </div>

        <div className={styles['report-buttonGroup']}>
          <button onClick={handleCreateSuspension} className={styles['report-button']}>
            Create
          </button>
          <button onClick={onClose} className={`${styles['report-button']} ${styles['report-button-cancel']}`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSuspensionModal;
