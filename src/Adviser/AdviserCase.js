import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import navigationStyles from '../Navigation.module.css';
import caseStyles from './AdviserCase.module.css';
import modalStyles from '../SSO/Modal.module.css';
import styles1 from '../GlobalForm.module.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AssessmentIcon from '@mui/icons-material/Assessment';

const createSidebarLink = (to, text, IconComponent) => (
    <Link to={to} className={navigationStyles['styled-link']}>
        <IconComponent className={navigationStyles.icon} />
        <span className={navigationStyles['link-text']}>{text}</span>
    </Link>
);

const AdviserCase = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        case_name: '',
        investigator: '',
        violation: '',
        description: '',
        status: '',
        handledBySSO: 0
    });

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        document.title = "Adviser | Cases";
    
        const fetchCases = async () => {
            try {
                // Fetch cases handled by the logged-in adviser
                const response = await fetch(`http://localhost:8080/api/cases/handledByAdviser/${loggedInUser.section}/${loggedInUser.schoolYear}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCases(data);
            } catch (error) {
                console.error('Failed to fetch cases:', error);
            }
        };
    
        fetchCases();
    }, [loggedInUser.uid]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/student/getAllStudentsByAdviser/${loggedInUser.section}/${loggedInUser.schoolYear}`);
                setStudents(response.data);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
    
        fetchStudents();
    }, [loggedInUser.schoolYear, loggedInUser.section]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataWithDefaultStatus = {
                ...formData,
                status: 'Pending', // Set default status to "Pending"
                id: selectedStudent ? selectedStudent.id : '' // Include selected student ID in form data
            };
    
            const response = await fetch('http://localhost:8080/api/cases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formDataWithDefaultStatus) // Send formData with default status and selected student ID
            });
    
            if (response.ok) {
                const newCase = await response.json();
                setCases((prevCases) => [...prevCases, newCase]);
                setFormData({
                    id: '',
                    case_name: '',
                    investigator: '',
                    violation: '',
                    description: '',
                    status: '' // Reset status in the form data
                });
                setSelectedStudent(null); // Reset selected student after submitting the form
                setModalOpen(false); // Close the modal
            } else {
                console.error('Failed to add case');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleDelete = async () => {
        if (selectedCaseId === null) {
            console.warn("No case selected for deletion");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/cases/${selectedCaseId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setCases((prevCases) => prevCases.filter((caseItem) => caseItem.cid !== selectedCaseId));
                setSelectedCaseId(null); // Clear the selected case after deletion
            } else {
                console.error('Failed to delete case');
            }
        } catch (error) {
            console.error('Error deleting case:', error);
        }
    };

    const selectCase = (id) => {
        setSelectedCaseId(id);
    };

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const sendToSSO = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/cases/${id}/sso`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ handledBySSO: 1 })
            });

            if (response.ok) {
                // Update the local state to reflect the change
                setCases((prevCases) =>
                    prevCases.map((caseItem) =>
                        caseItem.cid === id ? { ...caseItem, handledBySSO: 1 } : caseItem
                    )
                );
            } else {
                console.error('Failed to update case');
            }
        } catch (error) {
            console.error('Error updating case:', error);
        }
    };

    const handleComplete = async () => {
        if (selectedCaseId === null) {
            console.warn("No case selected for completion");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/cases/complete/${selectedCaseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setCases((prevCases) => prevCases.map((caseItem) =>
                    caseItem.cid === selectedCaseId ? { ...caseItem, status: 'Completed' } : caseItem
                ));
                setSelectedCaseId(null);
            } else {
                console.error('Failed to complete case');
            }
        } catch (error) {
            console.error('Error completing case:', error);
        }
    };

    return (
        <div className={navigationStyles.wrapper} style={{ backgroundImage: 'url(/public/image-2-3@2x.png)' }}>
            {/* Sidebar content */}
            <div className={navigationStyles.sidenav}>
                <img src="/image-removebg-preview (1).png" alt="" className={navigationStyles['sidebar-logo']} />
                {createSidebarLink("/report", "Report", AssessmentIcon)}
                {loggedInUser.userType !== 3 && createSidebarLink("/account", "Account", AccountBoxIcon)}
                {createSidebarLink("/student", "Student", SchoolIcon)}
                {createSidebarLink("/notification", "Notification", NotificationsActiveIcon)}
                {loggedInUser.userType !== 2 && (
                    <>
                        {loggedInUser.userType === 3 ?
                            createSidebarLink("/adviserCase", "Case", PostAddIcon) :
                            createSidebarLink("/case", "Case", PostAddIcon)
                        }
                    </>
                )}
                <button className={navigationStyles['logoutbtn']} onClick={handleLogout}>Logout</button>
            </div>
            {/* Main content */}
            <div className={navigationStyles.content}>
                <div className={caseStyles['case-container']}>
                    <h1>Case List</h1>
                    <table className={caseStyles['case-table']}>
                        <thead>
                            <tr>
                               
                                <th>Case#</th>
                                <th>Case Name</th>
                                <th>Investigator</th>
                                <th>Violation</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cases.map((caseItem) => (
                                <tr
                                    key={caseItem.cid}
                                    onClick={() => selectCase(caseItem.cid)}
                                    className={selectedCaseId === caseItem.cid ? caseStyles['selected-row'] : ''}
                                >
                                   
                                    <td>{caseItem.cid}</td>
                                    <td>{caseItem.case_name}</td>
                                    <td>{caseItem.investigator}</td>
                                    <td>{caseItem.violation}</td>
                                    <td>{caseItem.description}</td>
                                    <td className={caseItem.status === "Complete" ? caseStyles['status-complete'] : caseStyles['status-ongoing']}>
                                        <b>{caseItem.status}</b>
                                    </td>
                                    <td>
                                        {caseItem.status !== "Completed" && caseItem.handledBySSO === 0 && (
                                            <button onClick={() => sendToSSO(caseItem.cid)} className={caseStyles['send-to-sso']}>Send to SSO</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={openModal} className={caseStyles['add-case']}>Add Case</button>
                    <button onClick={handleDelete} className={caseStyles['delete-case']} disabled={selectedCaseId === null}>Delete Case</button>
                    <button onClick={handleComplete} className={caseStyles['complete-case']} disabled={selectedCaseId === null}>Complete Case</button>
                    {/* Modal content */}
                    {isModalOpen && (
                        <div className={modalStyles.overlay}>
                            <div className={modalStyles.modal}>
                                <form onSubmit={handleSubmit} className={styles1['add-student-form']}>
                                    <div className={modalStyles.space}>
                                        <button onClick={closeModal} className={modalStyles.closeButton}>✖</button>
                                    </div>
                                    <div className={styles1['form-container']}>
                                        <div className={styles1['form-group']}>
                                            <label htmlFor="sid">Student ID:</label>
                                            <Autocomplete
                                                id="student"
                                                value={selectedStudent}
                                                options={students}
                                                getOptionLabel={(option) => `${option.firstname} ${option.sid} Grade:${option.grade} Section:${option.section}`}
                                                onChange={(event, newValue) => {
                                                    setSelectedStudent(newValue);
                                                }}
                                                renderInput={(params) => <TextField {...params} style={{ width: 300 }} />}
                                            />
                                        </div>
                                        <div className={styles1['form-group']}>
                                            <label htmlFor="case_name">Case Name:</label>
                                            <input
                                                type="text"
                                                id="case_name"
                                                name="case_name"
                                                value={formData.case_name}
                                                onChange={handleInputChange}
                                                placeholder="Case Name"
                                                required
                                            />
                                        </div>
                                        <div className={styles1['form-group']}>
                                            <label htmlFor="investigator">Investigator:</label>
                                            <input
                                                type="text"
                                                id="investigator"
                                                name="investigator"
                                                value={formData.investigator}
                                                onChange={handleInputChange}
                                                placeholder="Investigator"
                                                required
                                            />
                                        </div>
                                        <div className={styles1['form-group']}>
                                            <label htmlFor="violation">Violation:</label>
                                            <input
                                                type="text"
                                                id="violation"
                                                name="violation"
                                                value={formData.violation}
                                                onChange={handleInputChange}
                                                placeholder="Violation"
                                                required
                                            />
                                        </div>
                                        <div className={styles1['form-group']}>
                                            <label htmlFor="description">Description:</label>
                                            <input
                                                type="text"
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Description"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className={styles1['add-student-button']}>Add Case</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdviserCase;
