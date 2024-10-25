import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RecordStudentEditModal.module.css'; // Import your CSS module
import formStyles from './GlobalForm.module.css';

const RecordStudentEditModal = ({ record, onClose }) => {
  const monitoredRecords = [
    'Absent',
    'Tardy',
    'Cutting Classes',
    'Improper Uniform',
    'Offense',
    'Misbehavior',
    'Clinic',
    'Sanction',
  ];

  // Initialize state with the record's data
  const [selectedRecord, setSelectedRecord] = useState(record?.monitored_record || '');
  const [sanction, setSanction] = useState(record?.sanction || '');

  // Effect to update local state when record prop changes
  useEffect(() => {
    if (record) {
      setSelectedRecord(record.monitored_record);
      setSanction(record.sanction);
    }
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) {
      alert('Please select a monitored record.');
      return;
    }

    // Prepare the updated record
    const updatedRecord = {
      ...record,
      monitored_record: selectedRecord,
      sanction: sanction,
    };

    try {
      await axios.put(`http://localhost:8080/student-record/update/${record.recordId}`, updatedRecord);
      alert('Record updated successfully!');
      onClose(); // Close modal after submission
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record.');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Edit Student Record</h2>
        <form onSubmit={handleSubmit}>
          <label>Monitored Record:</label>
          <select 
            value={selectedRecord} 
            onChange={(e) => setSelectedRecord(e.target.value)}
            className={styles.select}
          >
            <option value="">Select a monitored record</option>
            {monitoredRecords.map((record, index) => (
              <option key={index} value={record}>
                {record}
              </option>
            ))}
          </select>
          <label>Sanction:</label>
          <textarea 
            type="text" 
            value={sanction} 
            onChange={(e) => setSanction(e.target.value)} 
          />
          <div className={formStyles['global-buttonGroup']}>
            <button type="submit" className={formStyles['green-button']}>Edit</button>
            <button type="button" onClick={onClose} className={`${formStyles['green-button']} ${formStyles['red-button']}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordStudentEditModal;
