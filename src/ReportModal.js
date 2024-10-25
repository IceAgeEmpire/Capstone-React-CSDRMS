import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ReportModal.module.css'; // Correctly importing the styles

const ReportModal = ({ onClose, refreshReports }) => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = authToken ? JSON.parse(authToken) : null;

  const [newReport, setNewReport] = useState({
    complaint: '',
  });

  const [students, setStudents] = useState([]); // State for holding the list of students
  const [filteredStudents, setFilteredStudents] = useState([]); // State for holding filtered student results
  const [searchQuery, setSearchQuery] = useState(''); // State for handling the search query
  const [showDropdown, setShowDropdown] = useState(false); // State for showing/hiding dropdown

  // Fetch the list of students once when the component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Always fetch the default API for current students
        const response = await axios.get('http://localhost:8080/student/getAllCurrentStudents');
        setStudents(response.data); // Set fetched students
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    // Fetch students only when component mounts
    if (loggedInUser) {
      fetchStudents();
    }
  }, []); // Empty array ensures it only runs once

  // Filter students based on search query
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredStudents([]); // Show no students when search query is empty
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

  // Handle input changes for the form
  const handleInputChange = (e) => {
    setNewReport({ ...newReport, [e.target.name]: e.target.value });
  };

 // Handle creating a new report
const handleCreateReport = async () => {
  try {
    // Automatically set date, time, and complainant from logged-in user
    const reportData = {
      ...newReport,
      date: new Date().toISOString().split('T')[0], // Automatically set today's date
      time: new Date().toLocaleTimeString(), // Automatically set current time
      complainant: loggedInUser.username, // Set the logged-in user's username as the complainant
      encoder: loggedInUser.firstname + ' ' + loggedInUser.lastname,
      viewedByAdviser: loggedInUser.userType === 3 && loggedInUser.grade === newReport.grade && loggedInUser.section === newReport.section && loggedInUser.schoolYear === newReport.schoolYear, // Set viewedByAdviser to true if user is Adviser for the student
      viewedBySso: loggedInUser.userType === 1,      // Set viewedBySso to true if user is SSO
    };


    await axios.post(`http://localhost:8080/report/insertReport/${newReport.studentId}`, reportData);
    refreshReports(); // Refresh the reports list after submission
    onClose(); // Close the modal after submission
  } catch (error) { 
    console.error('Error creating report:', error);
    alert('The account for the adviser for this student is not existing')
  }
};


  // Handle student selection
  const handleSelectStudent = (student) => {
    setNewReport({
      ...newReport,
      studentId: student.id,
      grade: student.grade, // Assuming these properties exist on the student object
      section: student.section,
      schoolYear: student.schoolYear,
    });
    setSearchQuery(`${student.sid} - ${student.name}`); // Update the search field with selected student's details
    setShowDropdown(false); // Hide dropdown after selection
  };

  // Handle clearing the student selection
  const handleClearSelection = () => {
    setNewReport({ ...newReport, studentId: '' });
    setSearchQuery(''); // Clear the search query
    setShowDropdown(false); // Hide the dropdown
  };

  return (
    <div className={styles['report-modal-overlay']}>
      <div className={styles['report-modal-content']}>

        <h2>Create New Report</h2>

        {/* Student Search and Select Field */}
        <div className={styles['report-container']}>
          <div className={styles.searchWrapper}>
            <div className={styles['report-group']}>
              <label>Student: </label>
              <input  
              className={styles['report-input']}
              type="text"
              placeholder="Search student by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!!newReport.studentId} // Disable input if a student is selected
              />

              {/* Show "X" button when a student is selected */}
              {newReport.studentId && (
              <button className={styles.clearButton} onClick={handleClearSelection}>
                ✕
              </button>
              )}
            </div>
          </div>

          {/* Only show dropdown and messages when no student is selected */}
          {!newReport.studentId && (
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
              ) : null }
            </div>
          )}
        </div>

        {/* Complaint Field */}
        <div className={styles['report-group']}>
        <label>Complaint: </label>                
        <textarea
            className={styles['report-modal-textarea']} // Apply the new CSS class here
            name="complaint"
            placeholder="Complaint"
            value={newReport.complaint}
            onChange={handleInputChange}
        />
        </div>

        <div className={styles['report-buttonGroup']}>
          <button onClick={handleCreateReport} className={styles['report-button']}>Create</button>
          <button onClick={onClose} className={`${styles['report-button']} ${styles['report-button-cancel']}`}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
