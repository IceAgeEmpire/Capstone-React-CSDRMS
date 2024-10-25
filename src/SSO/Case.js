import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import navigationStyles from '../Navigation.module.css';
import styles1 from '../GlobalForm.module.css';
import caseStyles from './Case.module.css';
import modalStyles from './Modal.module.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

const createSidebarLink = (to, text, IconComponent) => (
    <Link to={to} className={navigationStyles['styled-link']}>
        <IconComponent className={navigationStyles.icon} />
        <span className={navigationStyles['link-text']}>{text}</span>
    </Link>
);

const Case = () => {
    const [cases, setCases] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [feedbackResult, setFeedbackResult] = useState('');
    const [feedbackedCases, setFeedbackedCases] = useState([]);
    const [followedUpCases, setFollowedUpCases] = useState([]);
    const [filter, setFilter] = useState('All');
    const authToken = localStorage.getItem('authToken');
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(authToken);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [isFollowUpModalOpen, setFollowUpModalOpen] = useState(false);
    const [isSanctionModalOpen, setSanctionModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        sid: '',
        case_name: '',
        investigator: '',
        violation: '',
        description: ''
    });

    const [followUpData, setFollowUpData] = useState({
        date: '',
        time: '',
        violation: '',
        name: '',
        reasoning: ''
    });

    const [sanctionData, setSanctionData] = useState({
        behaviorDetails: '',
        sanctionRecommendation: ''
    });

    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    useEffect(() => {
        document.title = "SSO | Cases";
        const fetchFeedbackedCases = async () => {
            try {
                const response = await fetch('http://localhost:8080/feedback/getFeedbacks');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setFeedbackedCases(data.map(feedback => feedback.cid));
            } catch (error) {
                console.error('Failed to fetch feedbacked cases:', error);
            }
        };

        const fetchFollowedUpCases = async () => {
            try {
                const response = await fetch('http://localhost:8080/followup/getAllFollowUps');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setFollowedUpCases(data.map(followUp => followUp.cid));
            } catch (error) {
                console.error('Failed to fetch followed up cases:', error);
            }
        };

        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:8080/student/getAllCurrentStudents');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('Failed to fetch students:', error);
            }
        };

        fetchFeedbackedCases();
        fetchFollowedUpCases();
        fetchStudents();
    }, []);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/cases/handledBySSO');
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
    }, []);

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
                id: selectedStudent ? selectedStudent.id : '', // Include selected student ID in form data
                handledBySSO: 1
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
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.ok) {
                setCases((prevCases) => prevCases.filter((caseItem) => caseItem.cid !== selectedCaseId));
                setSelectedCaseId(null);
            } else {
                console.error('Failed to delete case:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting case:', error);
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

    const handleSanctionSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/sanction/insertSanction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cid: selectedCaseId,
                    sanctionRecommendation: sanctionData.sanctionRecommendation
                })
            });

            if (response.ok) {
                setSanctionModalOpen(false);
                setSanctionData({ sanctionRecommendation: '' });
            } else {
                console.error('Failed to recommend sanction');
            }
        } catch (error) {
            console.error('Error recommending sanction:', error);
        }
    };

    const selectCase = (id, status) => {
        setSelectedCaseId(id);
        if (status === 'Completed') {
            setFeedbackResult('');
        }
    };

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const closeFeedbackModal = () => setFeedbackModalOpen(false);
    const openFeedbackModal = (caseId) => {
        setSelectedCaseId(caseId);
        setFeedbackResult('');
        setFeedbackModalOpen(true);
    };

    const handleFeedbackSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8080/feedback/insertFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },  
                body: JSON.stringify({
                    cid: selectedCaseId,
                    result: feedbackResult
                })
            });

            if (response.ok) {
                setFeedbackModalOpen(false);
                setFeedbackedCases((prevFeedbackedCases) => [...prevFeedbackedCases, selectedCaseId]);
            } else {
                console.error('Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    const closeFollowUpModal = () => setFollowUpModalOpen(false);
    const openFollowUpModal = (caseId) => {
        setFollowUpData({
            date: '',
            time: '',
            violation: '',
            name: '',
            reasoning: ''
        });
        setSelectedCaseId(caseId); // Ensure selectedCaseId is set when opening the modal
        setFollowUpModalOpen(true);
    };

    const openSanctionModal = (caseId) => {
        setSanctionData({
            behaviorDetails: '',
            sanctionRecommendation: ''
        });
        setSelectedCaseId(caseId);
        setSanctionModalOpen(true);
    };
    
    const closeSanctionModal = () => setSanctionModalOpen(false);
    

    const handleSubmitFollowUp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/followup/insertFollowUp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cid: selectedCaseId,
                    date: followUpData.date,
                    time: followUpData.time,
                    action: followUpData.action,
                    reasoning: followUpData.reasoning
                })
            });

            if (response.ok) {
                setFollowUpModalOpen(false);
                setCases((prevCases) => prevCases.map((caseItem) =>
                    caseItem.cid === selectedCaseId ? { ...caseItem, followedUp: true } : caseItem
                ));
                setFollowedUpCases((prevFollowedUpCases) => [...prevFollowedUpCases, selectedCaseId]); // Update the followed up cases list
            } else {
                console.error('Failed to add follow-up');
            }
        } catch (error) {
            console.error('Error adding follow-up:', error);
        }
    };

    const filteredCases = cases.filter(caseItem => {
        if (filter === 'All') return true;
        return caseItem.status === filter;
    });

    return (
    <div className={navigationStyles.wrapper} style={{ backgroundImage: 'url(/public/image-2-3@2x.png)' }}>
        <div className={navigationStyles.sidenav}>
            <img src="/image-removebg-preview (1).png" alt="" className={navigationStyles['sidebar-logo']} />
            {createSidebarLink("/report", "Report", AssessmentIcon)}
            {createSidebarLink("/student", "Student", SchoolIcon)}
            {createSidebarLink("/notification", "Notification", NotificationsActiveIcon)}
            {createSidebarLink("/case", "Case", PostAddIcon)}
            {loggedInUser.userType === 1 && createSidebarLink("/timelog", "Time Log", AccessTimeFilledIcon)}
            <button className={navigationStyles['logoutbtn']} onClick={handleLogout}>Logout</button>
        </div>
        <div className={navigationStyles.content}>
            <div className={caseStyles['case-container']}>
                <h1>Case List</h1>
                <div className={caseStyles['filter-container']}>
                    <label htmlFor="status-filter">Filter by status: </label>
                    <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <table className={caseStyles['case-table']}>
                    <thead>
                        <tr>
                            <th>Case#</th>
                            <th>StudentID</th>
                            <th>Case Name</th>
                            <th>Investigator</th>
                            <th>Violation</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCases.map((caseItem) => (
                            <tr
                                key={caseItem.cid}
                                onClick={() => selectCase(caseItem.cid, caseItem.status)}
                                className={selectedCaseId === caseItem.cid ? caseStyles['selected-row'] : ''}
                            >
                                <td>{caseItem.cid}</td>
                                <td>{caseItem.student.sid}</td>
                                <td>{caseItem.case_name}</td>
                                <td>{caseItem.investigator}</td>
                                <td>{caseItem.violation}</td>
                                <td>{caseItem.description}</td>
                                <td className={caseItem.status === "Completed" ? caseStyles['status-complete'] : caseStyles['status-ongoing']}>
                                    {caseItem.status}
                                </td>
                                <td>
                                    {caseItem.status === 'Pending' && !followedUpCases.includes(caseItem.cid) ? (
                                        <button onClick={() => openFollowUpModal(caseItem.cid)}>Investigate</button>
                                    ) : caseItem.status === 'Pending' && followedUpCases.includes(caseItem.cid) ? (
                                        <button className={caseStyles['disabled-button']} disabled>Followed up</button>
                                    ) : caseItem.status === 'Completed' && !feedbackedCases.includes(caseItem.cid) ? (
                                        <button onClick={() => openFeedbackModal(caseItem.cid)}>Feedback</button>
                                    ) : (
                                        <button onClick={() => openSanctionModal(caseItem.cid)}>Sanction</button>
                                    )}
                                    
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={caseStyles['button-container']}>
                    <button onClick={openModal} className={caseStyles['add-case']}>Add Case</button>
                    <button onClick={handleDelete} className={caseStyles['delete-case']} disabled={selectedCaseId === null}>Delete Case</button>
                    <button onClick={handleComplete} className={caseStyles['complete-case']} disabled={selectedCaseId === null}>Complete Case</button>
                </div>

                {isModalOpen && (
                    <div className={modalStyles.overlay}>
                        <div className={modalStyles.modal}>
                            <button onClick={closeModal} className={modalStyles.closeButton}>✖</button>
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

                {isFeedbackModalOpen && (
                    <div className={modalStyles.overlay}>
                        <div className={modalStyles.modal}>
                            <button onClick={closeFeedbackModal} className={modalStyles.closeButton}>✖</button>
                            <div className={caseStyles['feedback-container']}>
                                <h2>Feedback</h2>
                                <textarea
                                    value={feedbackResult}
                                    onChange={(e) => setFeedbackResult(e.target.value)}
                                    placeholder="Enter feedback result..."
                                    className={caseStyles['feedback-textarea']}
                                />
                                <button onClick={handleFeedbackSubmit} className={caseStyles['submit-feedback']}>Submit</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {isFollowUpModalOpen && (
                    <div className={modalStyles.overlay}>
                        <div className={modalStyles.modal}>
                            <button onClick={closeFollowUpModal} className={modalStyles.closeButton}>✖</button>
                            <form onSubmit={handleSubmitFollowUp} className={styles1['add-student-form']}>
                                <div className={modalStyles.space}>
                                    <button onClick={closeFollowUpModal} className={modalStyles.closeButton}>✖</button>
                                </div>
                                <div className={styles1['form-container']}>
                                    <div className={styles1['form-group']}>
                                        <label htmlFor="date">Date:</label>
                                        <input
                                            type="date"
                                            id="date"
                                            value={followUpData.date}
                                            min={getTodayDate()}
                                            onChange={(e) => setFollowUpData({ ...followUpData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles1['form-group']}>
                                        <label htmlFor="time">Time:</label>
                                        <input
                                            type="time"
                                            id="time"
                                            value={followUpData.time}
                                            onChange={(e) => setFollowUpData({ ...followUpData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles1['form-group']}>
                                        <label htmlFor="action">Action:</label>
                                        <input
                                            type="text"
                                            id="action"
                                            value={followUpData.action}
                                            onChange={(e) => setFollowUpData({ ...followUpData, action: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles1['form-group']}>
                                        <label htmlFor="reasoning">Reasoning:</label>
                                        <textarea
                                            id="reasoning"
                                            value={followUpData.reasoning}
                                            onChange={(e) => setFollowUpData({ ...followUpData, reasoning: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className={styles1['add-student-button']}>Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isSanctionModalOpen && (
                    <div className={modalStyles.overlay}>
                        <div className={modalStyles.modal}>
                            <button onClick={closeSanctionModal} className={modalStyles.closeButton}>✖</button>
                            <form onSubmit={handleSanctionSubmit} className={styles1['add-student-form']}>
                                <div className={modalStyles.space}>
                                    <button onClick={closeSanctionModal} className={modalStyles.closeButton}>✖</button>
                                </div>
                                <div className={styles1['form-container']}>
                                    <div className={styles1['form-group']}>
                                        <label htmlFor="sanctionRecommendation">Recommendation:</label>
                                        <textarea
                                            id="sanctionRecommendation"
                                            value={sanctionData.sanctionRecommendation}
                                            onChange={(e) => setSanctionData({ ...sanctionData, sanctionRecommendation: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className={styles1['add-student-button']}>Submit</button>
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

export default Case;
