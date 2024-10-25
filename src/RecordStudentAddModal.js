import React, { useState } from 'react';
import axios from 'axios';
import styles from './RecordModal.module.css'; // Importing CSS module for the modal
import formStyles from './GlobalForm.module.css'; // Importing GlobalForm styles

const AddRecordModal = ({ student, onClose, refreshRecords }) => {  // Add refreshRecords as a prop
  const [recordDate, setRecordDate] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [time, setTime] = useState('');
  const [monitoredRecord, setMonitoredRecord] = useState('');
  const [remarks, setRemarks] = useState('');

  const monitoredRecordsList = [
    'Absent',
    'Tardy',
    'Cutting Classes',
    'Improper Uniform',
    'Offense',
    'Misbehavior',
    'Clinic',
    'Sanction',
  ];

  const handleSubmit = async () => {
    const newRecord = {
      sid: student.sid,
      id: student.id, // Assuming `id` is available in the student object
      record_date: recordDate,
      incident_date: incidentDate,
      time: time,
      monitored_record: monitoredRecord,
      remarks: remarks,
    };

    try {
      await axios.post('http://localhost:8080/student-record/insertRecord', newRecord);
      alert('Record added successfully');
      refreshRecords(); // Call the refresh function to fetch updated records
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Error adding record');
    }
  };

  return (
    <div className={styles['student-modal-overlay']}>
      <div className={styles['student-add-modal-content']}>
        <h2>Add New Record for <br /> {student.name}</h2>
        
        <div className={formStyles['form-container']}>
          <div className={formStyles['form-group']}>
            <label>Record Date:</label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className={formStyles['input']}
            />
          </div>

          <div className={formStyles['form-group']}>
            <label>Incident Date:</label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className={formStyles['input']}
            />
          </div>

          <div className={formStyles['form-group']}>
            <label>Time:</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={formStyles['input']}
            />
          </div>

          <div className={formStyles['form-group']}>
            <label>Monitored Record:</label>
            <select
              value={monitoredRecord}
              onChange={(e) => setMonitoredRecord(e.target.value)}
              className={`${formStyles['input']} ${styles['student-modal-select']}`}
            >
              <option value="">Select Record Type</option>
              {monitoredRecordsList.map((record) => (
                <option key={record} value={record}>
                  {record}
                </option>
              ))}
            </select>
          </div>

          <div className={formStyles['form-group']}>
            <div className={formStyles['form-group-remarks']}>Remarks:</div>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className={formStyles['form-group-textarea']}  />
          </div>

          <div className={formStyles['global-buttonGroup']}>
            <button 
              className={formStyles['green-button']}
              onClick={handleSubmit}>
              Submit
            </button>
            <button 
              className={`${formStyles['green-button']} ${formStyles['red-button']}`}
              onClick={onClose}>
              Cancel
            </button>          
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRecordModal;
