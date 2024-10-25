import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import styles from '../Navigation.module.css'; // Import CSS module
import styles1 from '../GlobalForm.module.css'; // Import GlobalForm CSS module

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Sanction = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const navigate = useNavigate();
    const createSidebarLink = (to, text, IconComponent) => (
        <Link to={to} className={styles['styled-link']}>
            <IconComponent className={styles.icon} /> {/* Icon */}
            <span className={styles['link-text']}>{text}</span> {/* Text */}
        </Link>
    );

    const handleLogout = () => {
        // Clear the authentication token from localStorage
        localStorage.removeItem('authToken');
        // Redirect the user to the login page
        navigate('/');
    };

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [behaviorDetails, setBehaviorDetails] = useState('');
    const [sanctionRecommendation, setSanctionRecommendation] = useState('');

    useEffect(() => {
        document.title = "SSO | Sanction";
        const fetchStudents = async () => {
            try {
                const response = await axios.get('http://localhost:8080/student/getAllCurrentStudents');
                setStudents(response.data);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/sanction/insertSanction', {
                sid: selectedStudent?.sid, // Use selected student's sid
                behaviorDetails,
                sanctionRecommendation
            });
            console.log(response.data); // log response from the server
            // Clear form fields after successful submission
            setSelectedStudent(null);
            setBehaviorDetails('');
            setSanctionRecommendation('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className={styles.wrapper} style={{ backgroundImage: 'url(/public/image-2-3@2x.png)' }}>
            <div className={styles.sidenav}>
                <img src="/image-removebg-preview (1).png" alt="" className={styles['sidebar-logo']} />
                {loggedInUser.userType === 1 && createSidebarLink("/report", "Report", AssessmentIcon)}
                {loggedInUser.userType === 1 && createSidebarLink("/student", "Student", SchoolIcon)}
                {loggedInUser.userType === 1 && createSidebarLink("/notification", "Notification", NotificationsActiveIcon)}
                {loggedInUser.userType === 1 && createSidebarLink("/case", "Case", PostAddIcon)}
                {loggedInUser.userType === 1 && createSidebarLink("/sanctions", "Sanctions", LocalPoliceIcon)}
                <button className={styles['logoutbtn']} onClick={handleLogout}>Logout</button>
            </div>
            <div className={styles1.content}>
                <div className={styles1.contentform}>
                    <h1>Sanctions</h1>
                    <form onSubmit={handleSubmit} className={styles1['form-container']}>
                        <div className={styles1['form-group']}>
                            <label htmlFor="student">Student:</label>
                            <Autocomplete
                                id="student"
                                value={selectedStudent}
                                options={students}
                                getOptionLabel={(option) => `${option.firstname} ${option.lastname} Grade:${option.grade}  Section:${option.section}`}
                                onChange={(event, newValue) => {
                                    setSelectedStudent(newValue);
                                }}
                                renderInput={(params) => <TextField {...params} style={{ width: 300 }} />}
                            />
                        </div>
                        <div className={styles1['form-group']}>
                            <label htmlFor="behaviorDetails">Behavior Details:</label>
                            <textarea id="behaviorDetails" value={behaviorDetails} onChange={(e) => setBehaviorDetails(e.target.value)} required></textarea>
                        </div>
                        <div className={styles1['form-group']}>
                            <label htmlFor="sanctionRecommendation">Sanction Recommendation:</label>
                            <textarea id="sanctionRecommendation" value={sanctionRecommendation} onChange={(e) => setSanctionRecommendation(e.target.value)} required></textarea>
                        </div>
                        <button type="submit" className={styles1['global-button']}>Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Sanction;
