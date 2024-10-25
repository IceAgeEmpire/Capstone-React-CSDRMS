import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styles from '../Navigation.module.css'; // Import CSS module
import styles1 from '../GlobalForm.module.css';

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AssessmentIcon from '@mui/icons-material/Assessment';

const UpdateStudent = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const navigate = useNavigate(); 
    const { sid } = useParams();
    const [studentData, setStudentData] = useState({
        firstname: '',
        middlename: '',
        lastname: '',
        grade: '',
        section: '',
        con_num: '',
    });

    const createSidebarLink = (to, text, IconComponent) => (
    <Link to={to} className={styles['styled-link']}>
        <IconComponent className={styles.icon} />
        <span className={styles['link-text']}>{text}</span>
    </Link>
    );

    const handleLogout = () => {
        // Clear the authentication token from localStorage
        localStorage.removeItem('authToken');
        // Redirect the user to the login page
        navigate('/');
    };

    useEffect(() => {
        document.title = "Adviser | Update Student";
        fetch(`http://localhost:8080/student/getStudent/${sid}`)
            .then(response => response.json())
            .then(data => setStudentData(data))
            .catch(error => console.error('Error fetching student:', error));
    }, [sid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudentData({ ...studentData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`http://localhost:8080/student/updateStudent?sid=${sid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        })
        .then(response => {
            if (response.ok) {
                // Handle successful update, maybe redirect or show a success message
            } else {
                // Handle errors, maybe show an error message
            }
        })
        .catch(error => {
            console.error('Error updating student:', error);
            // Handle errors, maybe show an error message
        });
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.sidenav}>
                <img src="/image-removebg-preview (1).png" alt="" className={styles['sidebar-logo']}/>
                {createSidebarLink("/record", "Record", AssessmentIcon)}
                {loggedInUser.userType !== 3 && createSidebarLink("/account", "Account", AccountBoxIcon)}
                {createSidebarLink("/student", "Student", SchoolIcon)}
                {createSidebarLink("/notification", "Notification", NotificationsActiveIcon)}
                {createSidebarLink("/feedback", "Feedback", RateReviewIcon)}
                {loggedInUser.userType !== 3 && createSidebarLink("/sanctions", "Sanctions", LocalPoliceIcon)}
                {createSidebarLink("/report", "Report", PostAddIcon)}
                {loggedInUser.userType !== 2 && createSidebarLink("/Followup", "Followups", PendingActionsIcon)}
                <button className={styles['logoutbtn']} onClick={handleLogout}>Logout</button>
            </div>
            <div className={styles1.content}>
                <div className={styles1.contentform}>
                    <h2>Update Student</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles1['form-group']}>
                                <label> First Name: </label>
                                    <input type="text" name="firstname" value={studentData.firstname} onChange={handleChange}/>
                            </div>
                            <div className={styles1['form-group']}>
                                <label> Middle Name: </label>
                                    <input type="text" name="middlename" value={studentData.middlename} onChange={handleChange}/>
                            </div>
                            <div className={styles1['form-group']}>
                                <label> Last Name: </label>
                                    <input type="text" name="lastname"  value={studentData.lastname} onChange={handleChange}/>
                            </div>
                            <div className={styles1['form-group']}>
                                <label> Grade: </label>
                                    <input  type="number" name="grade" value={studentData.grade}  onChange={handleChange}/>
                            </div>
                            <div className={styles1['form-group']}>
                                <label>  Section: </label>
                                    <input type="text" name="section"  value={studentData.section} onChange={handleChange}/>
                            </div>
                            <div className={styles1['form-group']}>
                                <label> Contact Number: </label>
                                    <input type="text"  name="con_num" value={studentData.con_num} onChange={handleChange}/>
                            </div>
                            <button type="submit">Update Student</button>
                        </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateStudent;
