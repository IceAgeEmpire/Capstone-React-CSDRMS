import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import navStyles from '../Navigation.module.css';
import styles2 from '../GlobalTable.module.css';
import viewStyles from './ViewStudentRecord.module.css';

import SchoolIcon from '@mui/icons-material/School';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Helper function to create sidebar links
const createSidebarLink = (to, text, IconComponent) => (
    <Link to={to} className={navStyles['styled-link']}>
        <IconComponent className={navStyles.icon} />
        <span className={navStyles['link-text']}>{text}</span>
    </Link>
);

const ViewStudentRecord = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const navigate = useNavigate();
    const { id } = useParams();  
    const [student, setStudent] = useState(null);
    const [records, setRecords] = useState([]);

    // Set document title based on user type
    useEffect(() => {
        if (loggedInUser.userType === 3) {
            document.title = "Adviser | View Student Record";
        } else if (loggedInUser.userType === 4) {
            document.title = "SSO | View Student Record";
        }
    }, [loggedInUser.userType]);

    // Handle user logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    // Fetch student data based on userType
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                let response;
                if (loggedInUser.userType === 3) {
                    response = await fetch(`http://localhost:8080/student/getStudentById/${id}`);
                } else {
                    response = await fetch(`http://localhost:8080/student/getCurrentStudent/${id}`);
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStudent(data);
            } catch (error) {
                console.error('Error fetching student:', error);
            }
        };

        fetchStudent();
    }, [id, loggedInUser.userType]);

    // Fetch reports based on student information and userType
    useEffect(() => {
        if (student && student.sid) {
            const fetchRecords = async () => {
                try {
                    let response;
                    if (loggedInUser.userType === 3) {
                        const section = student.section;
                        const schoolYear = student.schoolYear;
                        response = await fetch(`http://localhost:8080/student-record/getStudentRecordsBySectionAndSchoolYear?section=${section}&schoolYear=${schoolYear}`);
                    } else {
                        response = await fetch(`http://localhost:8080/student-record/getStudentRecords/${student.sid}`);
                    }

                    const data = await response.json();
                    setRecords(data);
                } catch (error) {
                    console.error('Error fetching reports:', error);
                }
            };

            fetchRecords();
        }
    }, [student, loggedInUser.userType]);

    return (
        <div className={navStyles.wrapper} style={{ backgroundImage: 'url(/public/image-2-3@2x.png)' }}>
            <div className={navStyles.sidenav}>
                <img src="/image-removebg-preview (1).png" alt="" className={navStyles['sidebar-logo']} />
                {createSidebarLink("/record", "Record", AssessmentIcon)}
                {loggedInUser.userType !== 2 && createSidebarLink("/student", "Student", SchoolIcon)}
                {loggedInUser.userType !== 2 && createSidebarLink("/notification", "Notification", NotificationsActiveIcon)}
                {loggedInUser.userType !== 1 && loggedInUser.userType !== 2 && createSidebarLink("/feedback", "Feedback", RateReviewIcon)}
                {loggedInUser.userType !== 2 && createSidebarLink("/report", "Report", PostAddIcon)}
                {loggedInUser.userType !== 1 && loggedInUser.userType !== 2 && createSidebarLink("/viewSanctions", "Sanctions", LocalPoliceIcon)}
                {loggedInUser.userType !== 1 && loggedInUser.userType !== 2 && loggedInUser.userType !== 3 && createSidebarLink("/sanctions", "Sanctions", LocalPoliceIcon)}
                {loggedInUser.userType !== 1 && loggedInUser.userType !== 2 && createSidebarLink("/Followup", "Followups", PendingActionsIcon)}
                <button className={navStyles['logoutbtn']} onClick={handleLogout}>Logout</button>
            </div>
            <div className={navStyles.content}>
                <h2>Student Details</h2>
                {student ? (
                    <div className={navStyles['student-details']}>
                        <p><strong>Name:</strong> {student.firstname} {student.middlename} {student.lastname}</p>
                        <p><strong>Grade:</strong> {student.grade}</p>
                        <p><strong>Section:</strong> {student.section}</p>
                        <p><strong>School Year:</strong> {student.schoolYear}</p>
                    </div>
                ) : (
                    <p>Loading student details...</p>
                )}

                <div className={navStyles['add-report-button']}>
                    {loggedInUser.userType !== 2 && student && (
                        <Link to={`/add-record/${student.id}`}>
                            <button>Add Record</button>
                        </Link>
                    )}
                </div>
                <div className={styles2['table-container']}>
                    <h2>Student Records</h2>
                    <table className={styles2['global-table']}>
                        <thead>
                            <tr>
                                <th>School Year</th>
                                <th>Grade</th>
                                <th>Section</th>
                                <th>Incident Date</th>
                                <th>Monitored Record</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length > 0 ? (
                                records.map(record => (
                                    <tr key={record.rid}>
                                        <td>{record.student.schoolYear}</td>
                                        <td>{record.student.grade}</td>
                                        <td>{record.student.section}</td>
                                        <td>{record.incident_date}</td>
                                        <td>{record.monitored_record}</td>
                                        <td>{record.remarks}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan= "6" className={viewStyles.nonerecord} style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                                        No Student Records found...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewStudentRecord;
