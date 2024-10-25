import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './AddStudentRecord.css'; // Import CSS file for styling
import styles from '../Navigation.module.css';
import styles1 from '../GlobalForm.module.css';

import SchoolIcon from '@mui/icons-material/School';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Function to create sidebar links
const createSidebarLink = (to, text, IconComponent) => (
    <Link to={to} className={styles['styled-link']}>
        <IconComponent className={styles.icon} /> {/* Icon */}
        <span className={styles['link-text']}>{text}</span> {/* Text */}
    </Link>
);

const AddStudentRecord = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const navigate = useNavigate();
    const { sid } = useParams();
    const [student, setStudent] = useState(null);

    // Initialize report state
    const [record, setRecord] = useState({
        sid: '',
        id: '',  // Add `id` field for the student's unique ID
        name: '',
        section: '',
        grade: '',
        schoolYear: '',
        record_date: new Date().toISOString().split('T')[0],  // Automatically set today's date
        incident_date: '',
        time: '',
        monitored_record: '',
        remarks: '',
        sanction: ''
    });

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    // Fetch student data based on student ID
    useEffect(() => {
        document.title = "Add Record";
        const fetchStudent = async () => {
            try {
                const response = await fetch(`http://localhost:8080/student/getCurrentStudent/${sid}`);
                if (response.ok) {
                    const data = await response.json();
                    setStudent(data);
                } else {
                    throw new Error('Failed to fetch student details');
                }
            } catch (error) {
                console.error('Error fetching student details:', error);
            }
        };
        fetchStudent();
    }, [sid]);

    // Automatically set student information (name, section, grade, schoolYear, and id) once student data is fetched
    useEffect(() => {
        if (student) {
            const { id, firstname, middlename, lastname, section, grade, schoolYear } = student;
            const name = `${firstname} ${middlename} ${lastname}`;

            setRecord(prevRecord => ({
                ...prevRecord,
                sid: student.sid,
                id: student.id,  // Automatically add student's unique `id`
                name,
                section,
                grade,
                schoolYear
            }));
        }
    }, [student]);

    // Handle form field changes
    const handleChange = e => {
        const { name, value } = e.target;
        setRecord({ ...record, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async e => {
        e.preventDefault();

        const newRecord = { ...record };  // `id` is already included in the `report` state
        const response = await fetch('http://localhost:8080/student-record/insertRecord', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newRecord)
        });

        if (response.ok) {
            navigate(`/view-student-record/${student.id}`);
        }
    };

    if (!student) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className={styles.wrapper} style={{ backgroundImage: 'url(/public/image-2-3@2x.png)' }}>
            <div className={styles.sidenav}>
                <img src="/image-removebg-preview (1).png" alt="" className={styles['sidebar-logo']}/>
                {createSidebarLink("/record", "Record", AssessmentIcon)}
                {loggedInUser.userType !== 2 && createSidebarLink("/student", "Student", SchoolIcon)}
                {loggedInUser.userType !== 2 && createSidebarLink("/notification", "Notification", NotificationsActiveIcon)}
                {loggedInUser.userType !== 1 && loggedInUser.userType !== 2 && createSidebarLink("/feedback", "Feedback", RateReviewIcon)}
                {loggedInUser.userType !== 2 && createSidebarLink("/report", "Report", PostAddIcon)}
                {loggedInUser.userType !== 1 && loggedInUser.userType !== 3 && createSidebarLink("/sanctions", "Sanctions", LocalPoliceIcon)}
                {loggedInUser.userType !== 1 && loggedInUser.userType !== 2 && createSidebarLink("/Followup", "Followups", PendingActionsIcon)}
                <button className={styles['logoutbtn']} onClick={handleLogout}>Logout</button>
            </div>
            <div className={styles1.content}>
                <div className={styles1.contentform}>
                    <h1>Add Student Record</h1>
                    <h2>Student Details</h2>
                    <p>Name: {student.firstname} {student.middlename} {student.lastname}</p>
                    <p>Grade: {student.grade}</p>
                    <p>Section: {student.section}</p>
                    <p>Contact Number: {student.con_num}</p>
                    <form onSubmit={handleSubmit}>
                        <input type="hidden" name="sid" value={record.sid} required />
                        <input type="hidden" name="id" value={record.id} required /> {/* Hidden input for `id` */}
                        <label>
                            Incident Date:
                            <input type="date" name="incident_date" value={record.incident_date} onChange={handleChange} required />
                        </label>
                        <label>
                            Time:
                            <input type="time" name="time" value={record.time} onChange={handleChange} required />
                        </label>
                        <label>
                            Monitored Record:
                            <select name="monitored_record" value={record.monitored_record} onChange={handleChange} required>
                                <option value="">Select Monitored Record</option>
                                <option value="Clinic">Clinic</option>
                                <option value="Tardy">Tardy</option>
                                <option value="Absent">Absent</option>
                                <option value="Improper Uniform">Improper Uniform</option>
                                <option value="Cutting Classes">Cutting Classes</option>
                                <option value="Offense">Offense</option>
                                <option value="Misbehavior">Misbehavior</option>
                                {/* <option value="Sanction">Sanction</option> */}
                            </select>
                        </label>
                        <label>
                            Remarks:
                            <input type="text" name="remarks" value={record.remarks} onChange={handleChange} required />
                        </label>
                        {/* <label>
                            Sanction:
                            <input type="text" name="sanction" value={report.sanction} onChange={handleChange} required />
                        </label> */}
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddStudentRecord;
