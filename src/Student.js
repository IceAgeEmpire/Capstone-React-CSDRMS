import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import navStyles from './Navigation.module.css';
import Navigation from './Navigation';
import studentStyles from './Student.module.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const Student = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [file, setFile] = useState(null);
    const [schoolYears, setSchoolYears] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    // Fetch students and school years
    useEffect(() => {
        if (loggedInUser) {
            document.title = loggedInUser.userType === 3 ? "Adviser | Student" : loggedInUser.userType === 1 ? "SSO | Student" : "Student";

            // Fetch students based on userType
            const fetchStudents = async () => {
                try {
                    let url = '';
                    let params = {};

                    // Adviser-specific API call with section and school year
                    if (loggedInUser.userType === 3) {
                        url = 'http://localhost:8080/student/getAllStudentsByAdviser';
                        params = {
                            grade: loggedInUser.grade,
                            section: loggedInUser.section,
                            schoolYear: loggedInUser.schoolYear,
                        };
                    } else {
                        // For other user types
                        url = 'http://localhost:8080/student/getAllCurrentStudents';
                    }

                    const response = await axios.get(url, {
                        params,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    });

                    setStudents(response.data); // Set students in state
                } catch (error) {
                    console.error('Error fetching students:', error);
                }
            };

            fetchStudents();

            // Fetch school years for the dropdown
            fetch('http://localhost:8080/schoolYear/getAllSchoolYears')
                .then(response => response.json())
                .then(data => setSchoolYears(data))
                .catch(error => console.error('Error fetching school years:', error));

        } else {
            console.error('Logged-in user details are missing.');
        }
    }, [loggedInUser, authToken]);

    // Remove selected student if no longer in the student list
    useEffect(() => {
        if (students.length === 0 || !students.some(s => s.id === selectedStudent?.id)) {
            setSelectedStudent(null);
        }
    }, [students, selectedStudent]);

    const handleDelete = (sid) => {
        if (window.confirm(`Type 'delete' to confirm deletion of student SID ${sid}`)) {
            fetch(`http://localhost:8080/student/deleteStudent/${sid}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        setStudents(prevStudents => prevStudents.filter(student => student.sid !== sid));
                    } else {
                        console.error('Failed to delete student');
                    }
                })
                .catch(error => console.error('Error deleting student:', error));
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
    };

    const handleAddRecord = () => {
        if (!selectedStudent || selectedStudent.current === 0) {
            alert('You cannot add a record to this student.');
        } else {
            navigate(`/add-record/${selectedStudent.id}`);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSchoolYearChange = (e) => {
        setSelectedSchoolYear(e.target.value);
    };

    const handleFileUpload = async () => {
        if (!file) {
            alert('Please select a file first.');
            return;
        }
        if (!selectedSchoolYear) {
            alert('Please select a school year.');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('schoolYear', selectedSchoolYear); // Add school year to the request

        try {
            const response = await axios.post('http://localhost:8080/student/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                alert('File uploaded successfully!');
                setStudents(prevStudents => [...prevStudents, ...response.data]);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredStudents = useMemo(() => students.filter(student => {
        const query = searchQuery.toLowerCase();
        const name = `${student.firstname} ${student.middlename ? student.middlename + ' ' : ''}${student.lastname}`.toLowerCase();
        const gradeSection = `${student.grade} - ${student.section}`.toLowerCase();
        return (
            (student.sid && student.sid.toLowerCase().includes(query)) ||
            name.includes(query) ||
            gradeSection.includes(query) ||
            (student.con_num && student.con_num.toLowerCase().includes(query))
        );
    }), [students, searchQuery]);

    return (
        <div className={navStyles.wrapper}>
            <Navigation loggedInUser={loggedInUser} />
           
            <div className={navStyles.content}>
                <div className={studentStyles['student-content']}>
                    <div className={navStyles['h1-title']}>Student Records</div>
                    <div className={studentStyles['searchfilter']}>
                        <select onChange={handleSchoolYearChange} value={selectedSchoolYear} className={studentStyles['school-year-dropdown']}>
                            <option value="">Select School Year</option>
                            {schoolYears.map((year) => (
                                <option key={year.schoolYear_ID} value={year.schoolYear}>{year.schoolYear}</option>
                            ))}
                        </select>                    
                        <input
                            type="search"
                            placeholder="Search by SID, Name, Grade - Section or Contact No."
                            className={studentStyles.searchStud}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {(loggedInUser.userType === 3) && (
                        <Link to="/add-student">
                            <button className={studentStyles['add-student-button']}>Add Student</button>
                        </Link>
                    )}

                    {loggedInUser.userType === 1 && (
                        <div className={studentStyles['import-section']}>
                            <input type="file" onChange={handleFileChange} accept=".xls,.xlsx" />
                            <button onClick={handleFileUpload} disabled={isUploading} className={studentStyles['import-button']}>
                                {isUploading ? 'Uploading...' : 'Import Student Data'}
                            </button>
                        </div>
                    )}

                    <div className={studentStyles['student-container']}>
                        {filteredStudents.length > 0 ? (
                            <table className={studentStyles['student-table']}>
                                <thead>
                                    <tr>
                                        <th>SID</th>
                                        <th>Name</th>
                                        <th>Grade - Section</th>
                                        <th>Gender</th>
                                        {loggedInUser.userType === 3 && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr
                                            key={student.id}
                                            onClick={() => handleSelectStudent(student)}
                                            onDoubleClick={() => navigate(`/view-student-record/${student.id}`)}
                                            className={selectedStudent?.id === student.id ? studentStyles['selected-row'] : ''}
                                        >
                                            <td>{student.sid}</td>
                                            <td>{student.name}</td>
                                            <td>{`${student.grade} - ${student.section}`}</td>
                                            <td>{student.gender}</td>
                                            {loggedInUser.userType === 3 && (
                                                <td>
                                                    <Link to={`/update-student/${student.sid}`}>
                                                        <EditIcon className={`${studentStyles['icon-button']} ${studentStyles['icon-edit']}`} />
                                                    </Link>
                                                    <DeleteIcon className={`${studentStyles['icon-button']} ${studentStyles['icon-delete']}`} onClick={() => handleDelete(student.sid)} />
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className={studentStyles['nonestudent']}>No Students found...</p>
                        )}
                    </div>

                    {selectedStudent && (
                        <button onClick={handleAddRecord} className={studentStyles['add-report-button']} disabled={!selectedStudent}>
                            Add Record for {selectedStudent.name} 
                        </button>
                    )}
                </div>
            </div>                 
        </div>
    );
};

export default Student;
