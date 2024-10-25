import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RecordFilter from './RecordFilter'; // Import RecordFilter component
import AddRecordModal from './RecordStudentAddModal'; // Import AddRecordModal component
import ImportModal from './RecordStudentImportModal'; // Import ImportModal component
import styles from './Record.module.css'; // Importing CSS module
import formStyles from './GlobalForm.module.css'; // Importing GlobalForm styles
import tableStyles from './GlobalTable.module.css'; // Importing GlobalForm styles
import RecordStudentEditModal from './RecordStudentEditModal';
import RecordStudentViewModal from './RecordStudentViewModal'; // Import the view modal
import AddStudentModal from './Adviser/AddStudentModal';
import EditNoteIcon from '@mui/icons-material/Edit';
import ViewNoteIcon from '@mui/icons-material/Visibility';

const RecordStudent = ({ loggedInUser, schoolYears, grades, students, setStudents }) => {
  const [filteredStudents, setFilteredStudents] = useState([]); // For filtered search results
  const [searchQuery, setSearchQuery] = useState(''); // Hold the search term
  const [selectedStudent, setSelectedStudent] = useState(null); // Hold the selected student
  const [adviser, setAdviser] = useState(null); // Hold adviser's data
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(''); 
  const [selectedWeek, setSelectedWeek] = useState('');
  const [showAddRecordModal, setShowAddRecordModal] = useState(false); // Modal visibility state
  const [showImportModal, setShowImportModal] = useState(false); // Control ImportModal visibility
  const [showAddStudentModal, setShowAddStudentModal] = useState(false); 
  const [showEditRecordModal, setShowEditRecordModal] = useState(false); // Modal visibility state
  const [showViewRecordModal, setShowViewRecordModal] = useState(false); // State to control view modal
  const [recordToEdit, setRecordToEdit] = useState(null); // Hold the record to edit
  const [recordToView, setRecordToView] = useState(null); // Hold the record to view

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

  const fetchStudentRecords = async (sid) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/student-record/getStudentRecords/${sid}`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching student records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdviser = async (grade, section, schoolYear) => {
    try {
      const response = await axios.get(`http://localhost:8080/user/adviser`, {
        params: { grade, section, schoolYear }
      });
      setAdviser(response.data);
    } catch (error) {
      console.error('Error fetching adviser:', error);
    }
  };
  
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchStudentRecords(student.sid); // Fetch records for the selected student
    fetchAdviser(student.grade, student.section, student.schoolYear); // Fetch adviser's info
    setSearchQuery(''); // Reset search query to close the dropdown
  };

  const getWeekNumber = (date) => {
    const dayOfMonth = date.getDate();
    return Math.ceil(dayOfMonth / 7);
  };

  const filteredRecords = records.filter((record) => {
    const recordMonth = new Date(record.record_date).getMonth() + 1;
    const formattedMonth = recordMonth < 10 ? `0${recordMonth}` : `${recordMonth}`;

    const recordWeek = getWeekNumber(new Date(record.record_date));

    return (
      (!selectedSchoolYear || record.student.schoolYear === selectedSchoolYear) &&
      (!selectedMonth || formattedMonth === selectedMonth) &&
      (!selectedWeek || recordWeek === parseInt(selectedWeek, 10))
    );
  });

  const countFrequency = () => {
    const frequencies = monitoredRecordsList.reduce((acc, record) => {
      acc[record] = 0; // Initialize each monitored record with 0
      return acc;
    }, {});
  
    filteredRecords.forEach((record) => {
      if (frequencies[record.monitored_record] !== undefined) {
        frequencies[record.monitored_record]++;
      }
    });
  
    // Count sanctions separately
    const sanctionFrequency = filteredRecords.reduce((count, record) => {
      if (record.sanction) {
        count++;
      }
      return count;
    }, 0);
  
    return { ...frequencies, Sanction: sanctionFrequency };
  };
  
  const frequencies = countFrequency();
  
  return (
    <>
      <div className={styles.TitleContainer}>
        <h2 className={styles.RecordTitle}>Student Overview</h2> 
      </div>      
      <div className={styles['triple-container']}>
        {/* Display selected student details */}
        <div className={styles['details-container']}>
          <label>Details: </label>
          <table className={styles['details-table']}>
            <tbody>
              <tr>
                <td><strong>ID Number</strong></td>
                <td><strong>:</strong></td>
                <td>{selectedStudent?.sid || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Name</strong></td>
                <td><strong>:</strong></td>
                <td>{selectedStudent?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Grade</strong></td>
                <td><strong>:</strong></td>
                <td>{selectedStudent?.grade || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Section</strong></td>
                <td><strong>:</strong></td>
                <td>{selectedStudent?.section || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Gender</strong></td>
                <td><strong>:</strong></td>
                <td>{selectedStudent?.gender || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Adviser</strong></td>
                <td><strong>:</strong></td>
                <td>{adviser ? `${adviser.firstname} ${adviser.lastname}` : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>    

        {/* Search Bar for Students */}
        <div className={styles['search-container']}>
          <h2 className={styles['h2-title-record']}>Total Frequency of Monitored Records</h2>
          <div className={tableStyles['table-container']}>
            <table className={tableStyles['global-table-small']}>
              <thead>
                <tr>
                  {monitoredRecordsList.map((monitoredRecord, index) => (
                    <th key={index}>{monitoredRecord}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {monitoredRecordsList.map((monitoredRecord, index) => (
                    <td key={index}>{frequencies[monitoredRecord]}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <label htmlFor="studentSearch">Search: </label>
          <input
            type="text"
            id="studentSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter student name or ID"
          />

          {/* Import Modal */}
          {showImportModal && (
            <ImportModal
              onClose={() => setShowImportModal(false)}
              schoolYears={schoolYears}
            />
          )}

          {showAddStudentModal && ( 
            <AddStudentModal
              open={showAddStudentModal}
              onClose={() => setShowAddStudentModal(false)}
            />    
          )}
        
          {/* Add Record Modal */}
          {showAddRecordModal && (
            <AddRecordModal
              student={selectedStudent}
              onClose={() => setShowAddRecordModal(false)}
              refreshRecords={() => fetchStudentRecords(selectedStudent.sid)} // Pass the refresh function
            />
          )}        
          
          {/* Button to open Import Modal */}
          {loggedInUser?.userType !== 3 && (
            <button onClick={() => setShowImportModal(true)} 
              className={`${formStyles['green-button']} ${formStyles['maroon-button']}`} 
              style={{ marginLeft: '20px' }}>
              Import Students
            </button>
          )}      

          {loggedInUser?.userType !== 3 && (
            <button onClick={() => setShowAddStudentModal(true)} 
              className={formStyles['green-button']} 
              style={{ marginLeft: '10px' }}>
              Add Student
            </button>
          )}           

          {/* Only show the student list if the searchQuery is not empty and filtered students exist */}
          {searchQuery && (
            <div>
              {filteredStudents.length > 0 ? (
                <div className={formStyles['global-dropdown']}>
                  {filteredStudents.map((student) => (
                    <div
                      key={student.sid} 
                      onClick={() => handleStudentSelect(student)} // Dropdown disappears after selection
                      className={formStyles['global-dropdown-item']}>
                      {student.name} ({student.sid})
                    </div>
                  ))}
                </div>
              ) : (
                <p className={formStyles['global-dropdown']}>No students found.</p>
              )}
            </div>
          )}  
          
        </div>    
      </div>   

      {/* Display records if student is selected */}
      {selectedStudent && (
        <>
          {/* Use RecordFilter component to filter by school year, month, week */}
          <div className={styles['filter-container']}>
            {selectedStudent && (
              <RecordFilter
                schoolYears={schoolYears}
                grades={grades}
                loggedInUser={loggedInUser}
                selectedSchoolYear={selectedSchoolYear}
                setSelectedSchoolYear={setSelectedSchoolYear}
                selectedGrade={null} // Pass null or undefined since we don't want grade filter
                setSelectedGrade={() => {}} // Empty setter for grade
                selectedSection={null} // Pass null or undefined since we don't want section filter
                setSelectedSection={() => {}} // Empty setter for section
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
                showGradeAndSection={false} // Hide grade and section filters
              />
            )}    
          </div>         
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Detailed Records</h2>
            {selectedStudent && loggedInUser?.userType === 1 && (
              <button
                className={`${formStyles['green-button']} ${formStyles['orange-button']}`} 
                onClick={() => setShowAddRecordModal(true)}
              >
                Add Record
              </button>
            )}
          </div>
                      
          <div className={tableStyles['table-container']}>
            <table className={tableStyles['global-table']}>
              <thead>
                <tr>
                  <th>Record Date</th>
                  <th>Incident Date</th>
                  <th>Monitored Record</th>
                  {/* <th>Sanction</th> */}
                  <th>Action</th>
                </tr>
              </thead>  
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.recordId}>
                    <td>{record.record_date}</td>
                    <td>{record.incident_date}</td>
                    <td>{record.monitored_record}</td>
                    {/* <td>{record.sanction}</td> */}
                    <td>
                      <ViewNoteIcon
                        onClick={() => {
                          setRecordToView(record); // Set the record to view
                          setShowViewRecordModal(true); // Show the view modal
                        }}
                        className={styles['record-action-icon']}
                        style={{ marginRight: loggedInUser?.userType === 3 ? '0' : '15px' }}  
                      />   
                      {loggedInUser?.userType === 1 && (
                        <EditNoteIcon
                          onClick={() => {
                            setRecordToEdit(record); // Set the record to edit
                            setShowEditRecordModal(true); // Show the edit modal
                          }}
                          className={styles['record-action-icon']}
                        />                   
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>      

          {/* Add the View Modal here */}
          {showViewRecordModal && (
            <RecordStudentViewModal
              record={recordToView} // Pass the record to view
              onClose={() => setShowViewRecordModal(false)} // Close handler
            />
          )}

          {showEditRecordModal && (
            <RecordStudentEditModal
              record={recordToEdit} // Pass the record to edit
              onClose={() => setShowEditRecordModal(false)} // Close handler
            />
          )}     
        </>
      )}
    </>
  );
};

export default RecordStudent;
