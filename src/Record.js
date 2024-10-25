import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RecordTable from './RecordTable';
import RecordAnalytics from './RecordAnalytics';
import ViewStudentRecord from './RecordStudent'; // Import the ViewRecord component
import recStyle from './Record.module.css'; // CSS for Record
import navStyles from './Navigation.module.css'; // CSS for Navigation
import Navigation from './Navigation'; // Import the Navigation component

const Record = () => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = authToken ? JSON.parse(authToken) : null;
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]); // State for students
  const [view, setView] = useState('table'); // Toggle view between table, analytics, and viewRecord
  const [loading, setLoading] = useState(false); // Loading state
  const [schoolYears, setSchoolYears] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    fetchRecords();
    fetchInitialData(); // Fetch both school years and grades in one go
    fetchStudents(); // Fetch students when component mounts
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = loggedInUser?.userType === 3 
        ? await axios.get(`http://localhost:8080/student-record/getStudentRecordsByAdviser`, {
            params: { 
              grade: loggedInUser.grade, // Assuming grade is available in the loggedInUser object
              section: loggedInUser.section, 
              schoolYear: loggedInUser.schoolYear 
            }
          })
        : await axios.get('http://localhost:8080/student-record/getAllStudentRecords');
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchInitialData = async () => {
    try {
      const [schoolYearResponse, gradeResponse] = await Promise.all([
        axios.get('http://localhost:8080/schoolYear/getAllSchoolYears'),
        axios.get('http://localhost:8080/class/allUniqueGrades')
      ]);
      setSchoolYears(schoolYearResponse.data);
      setGrades(gradeResponse.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = loggedInUser?.userType === 3
        ? await axios.get('http://localhost:8080/student/getAllStudentsByAdviser', {
            params: { grade: loggedInUser.grade, section: loggedInUser.section, schoolYear: loggedInUser.schoolYear },
          })
        : await axios.get('http://localhost:8080/student/getAllCurrentStudents');

      setStudents(response.data); // Set students data
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Handle switching views based on the selected radio option
  const handleViewChange = (event) => {
    setView(event.target.value); // Set the view based on the selected radio button
  };

  return (
    <div className={navStyles['wrapper']}>
      <Navigation loggedInUser={loggedInUser} />

      {/* Main Content */}
      <div className={navStyles.content}>
        <div className={recStyle.TitleContainer}>
          <div className={recStyle['h1-title']}>Junior High School Records</div>

          {/* Radio Button Toggle for switching views */}
          <div className={recStyle['view-wrapper']}>
            <div className={recStyle['view-option']}>
              <input
                checked={view === 'table'}
                value="table"
                name="btn"
                type="radio"
                className={recStyle['view-input']}
                onChange={handleViewChange}
              />
              <div className={recStyle['view-btn']}>
                <span className={recStyle['view-span']}>Table</span>
              </div>
            </div>

            <div className={recStyle['view-option']}>
              <input
                checked={view === 'analytics'}
                value="analytics"
                name="btn"
                type="radio"
                className={recStyle['view-input']}
                onChange={handleViewChange}
              />
              <div className={recStyle['view-btn']}>
                <span className={recStyle['view-span']}>Analytics</span>
              </div>
            </div>
            
            {(loggedInUser?.userType === 1 || loggedInUser?.userType === 3) && (            <div className={recStyle['view-option']}>
              <input
                checked={view === 'viewRecord'}
                value="viewRecord"
                name="btn"
                type="radio"
                className={recStyle['view-input']}
                onChange={handleViewChange}
              />
              <div className={recStyle['view-btn']}>
                <span className={recStyle['view-span']}>Student</span>
              </div>
            </div>
            )}
          </div>
        </div>
        {loading ? (
          <div className="loading">
            <div class="slide"><i></i></div>
            <div class="paper"></div>
            <div class="keyboard"></div>
        </div>
        ) : view === 'table' ? (
          <RecordTable records={records} schoolYears={schoolYears} grades={grades} />
        ) : view === 'analytics' ? (
          <RecordAnalytics records={records} schoolYears={schoolYears} grades={grades} />
        ) : (
          (loggedInUser?.userType === 1 || loggedInUser?.userType === 3) && ( 
            <ViewStudentRecord
            loggedInUser={loggedInUser}
            schoolYears={schoolYears} // Pass schoolYears from Record.js
            grades={grades} // Pass grades from Record.js
            students={students} // Pass students from Record.js
            setStudents={setStudents} // Pass setStudents in case you need to update the state
          />
          )
        )}
        
      </div>
    </div>
  );
};

export default Record;
