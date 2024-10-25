import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditReportModal.module.css';
import formStyles from './GlobalForm.module.css';

const EditReportModal = ({ reportId, onClose, refreshReports }) => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = authToken ? JSON.parse(authToken) : null;

  const [reportData, setReportData] = useState({
    record: {
      id: '', // Student ID will now be stored here
      monitored_record: '',
    },
    date: '',
    time: '',
    complaint: '',
    complainant: '',
    complete: false,
    received: '',
    viewedByAdviser: false,
    viewedBySso: false,
  });

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

  const [students, setStudents] = useState([]); // Store all students
  const [filteredStudents, setFilteredStudents] = useState([]); // For search results
  const [searchQuery, setSearchQuery] = useState(''); // Search term for filtering students
  const [showDropdown, setShowDropdown] = useState(false); // Show or hide dropdown

  // Fetch the report data and set it in the form
  useEffect(() => {
    if (reportId) {
      axios.get(`http://localhost:8080/report/getReport/${reportId}`)
        .then(response => {
          setReportData(response.data);
          setSearchQuery(response.data.record?.id ? `${response.data.record.id} - ${response.data.record.student?.name}` : ''); // Set the current student name in the search field
        })
        .catch(error => console.error('Error fetching report:', error));
    }
  }, [reportId]);

  // Fetch students based on userType
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        let response;
        if (loggedInUser?.userType === 3) {
          response = await axios.get('http://localhost:8080/student/getAllStudentsByAdviser', {
            params: {
              grade: loggedInUser.grade,
              section: loggedInUser.section,
              schoolYear: loggedInUser.schoolYear,
            },
          });
        } else {
          response = await axios.get('http://localhost:8080/student/getAllCurrentStudents');
        }
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    if (loggedInUser) {
      fetchStudents();
    }
  }, []);

  // Filter students based on search query
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredStudents([]); // Show no students if search query is empty
    } else {
      const lowercasedSearchTerm = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(lowercasedSearchTerm) ||
          student.sid.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  // Handle input changes for the report data
  const handleInputChange = (e) => {
    setReportData({ ...reportData, [e.target.name]: e.target.value });
  };

  // Handle monitored record change
  const handleMonitoredRecordChange = (e) => {
    setReportData({ ...reportData, record: { ...reportData.record, monitored_record: e.target.value } });
  };

  // Handle submitting the updated report
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reportData.date || !reportData.time || !reportData.complaint || !reportData.complainant || !reportData.received || !reportData.record.id || !reportData.record.monitored_record) {
      alert('All fields are required.');
      return;
    }

    const viewedByAdviser = loggedInUser.userType === 3 &&
    loggedInUser.grade === reportData.grade && // Adjust this to match the structure of your reportData
    loggedInUser.section === reportData.section && // Adjust accordingly
    loggedInUser.schoolYear === reportData.schoolYear; // Adjust accordingly

    const viewedBySso = loggedInUser.userType === 1;

    const updatedReportData = {
      ...reportData,
      viewedByAdviser,
      viewedBySso,
    };

    try {
      await axios.put(`http://localhost:8080/report/updateReport/${reportId}/${reportData.record.id}/${reportData.record.monitored_record}`, updatedReportData);
      refreshReports(); // Refresh the report list after submission
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update the report.');
    }
  };

  // Handle selecting a student from the dropdown
  const handleSelectStudent = (student) => {
    setReportData({ ...reportData, record: { ...reportData.record, id: student.id } }); // Update record.id with the selected student's ID
    setSearchQuery(`${student.sid} - ${student.name}`); // Update the search field with selected student's details
    setShowDropdown(false); // Hide dropdown after selection
  };

  // Handle clearing the student selection
  const handleClearSelection = () => {
    setReportData({ ...reportData, record: { ...reportData.record, id: '' } }); // Clear record.id
    setSearchQuery(''); // Clear the search query
    setShowDropdown(false); // Hide the dropdown
  };

  return (
    <div className={styles['edit-report-modal']}>
      <div className={styles['edit-report-modal-content']}>
        <h2>Edit Report</h2>

        <form onSubmit={handleSubmit}>
          {/* Student Search and Select Field */}
          <label>Student:</label>
          <div className={styles['edit-report-group']}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search student by name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!!reportData.record.id} // Disable input if a student is selected
                required
              />
              
              {/* Show "X" button inside the input when a student is selected */}
              {reportData.record.id && (
                <button className={styles.clearButton} onClick={handleClearSelection}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Only show dropdown and messages when no student is selected */}
          {!reportData.record.id && (
            <div>
              {/* Show filtered students only when search query is not empty */}
              {searchQuery && filteredStudents.length > 0 ? (
                <ul className={styles.dropdown}>
                  {filteredStudents.map((student) => (
                    <li key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={styles.dropdownItem}>
                      {student.name} ({student.sid})
                    </li>
                  ))}
                </ul>
              ) : searchQuery && filteredStudents.length === 0 ? (
                <p className={styles.dropdown}>No students found.</p>
              ) : null}
            </div>
          )}

        <label>Monitored Record:</label>
          <select
            name="monitored_record"
            value={reportData.record.monitored_record}
            onChange={handleMonitoredRecordChange}
            required
          >
            <option value="">Select a monitored record</option>
            {monitoredRecords.map((record, index) => (
              <option key={index} value={record}>{record}</option>
            ))}
          </select>

          {/* Date Field */}

          
          {/* <label>Date:</label>
          <input
            type="date"
            name="date"
            value={reportData.date}
            onChange={handleInputChange}
            required
          />

         
          <label>Time:</label>
          <input
            type="time"
            name="time"
            value={reportData.time}
            onChange={handleInputChange}
            required
          /> */}

          {/* Complaint Field */}
          <label>Complaint:</label>
          <textarea
            name="complaint"
            placeholder="Complaint"
            value={reportData.complaint}
            onChange={handleInputChange}
            required
          />       

          <div className={formStyles['global-buttonGroup']}>
            <button className={formStyles['green-button']} type="submit">Update</button>
            <button onClick={onClose} className={`${formStyles['green-button']} ${formStyles['red-button']}`}>Cancel</button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditReportModal;
