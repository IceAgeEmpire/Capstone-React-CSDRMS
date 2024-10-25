import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import styles from './AddStudentModal.module.css'; // Import AddStudent.css
import formStyles from '../GlobalForm.module.css';


const AddStudentModal = ({ open, onClose }) => {
    useEffect(() => {
        document.title = "Adviser | Add Student";
    }, []); 

    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const navigate = useNavigate(); 

    const [studentData, setStudentData] = useState({
        sid: '',
        name: '',
        grade: '',
        section: '',
        gender: '', // Adding gender field to the state
        schoolYear: '',
        current: 1
    });

    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);

    // Fetch grades and school years on component mount
    useEffect(() => {
        fetch('http://localhost:8080/class/allUniqueGrades')
            .then((response) => response.json())
            .then((data) => setGrades(data))
            .catch((error) => console.error('Error fetching grades:', error));

        fetch('http://localhost:8080/schoolYear/getAllSchoolYears')
            .then((response) => response.json())
            .then((data) => setSchoolYears(data))
            .catch((error) => console.error('Error fetching school years:', error));
    }, []);

    // Fetch sections when grade is selected
    useEffect(() => {
        if (studentData.grade) {
            fetch(`http://localhost:8080/class/sections/${studentData.grade}`)
                .then((response) => response.json())
                .then((data) => setSections(data))
                .catch((error) => console.error('Error fetching sections:', error));
        }
    }, [studentData.grade]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudentData({ ...studentData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:8080/student/insertStudent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        })
        .then((response) => {
            if (response.ok) {
                onClose(); // Close the modal on success
            } else {
                alert('Student with this ID and school year already exists.');
            }
        })
        .catch((error) => {
            console.error('Error inserting student:', error);
        });
    };

    return ReactDOM.createPortal(
        <div className={styles['modal-overlay']} open={open} onClose={onClose}>
            <div className={styles['modal-content']}>
            <h2>Add Student</h2>
                <form onSubmit={handleSubmit} className={formStyles['form-container']}>
                        <div className={formStyles['form-group']}>
                            <label htmlFor="sid">Student ID:</label>
                            <input 
                                type="text"
                                id="sid"
                                name="sid"
                                value={studentData.sid}
                                onChange={handleChange}
                                placeholder="Student ID"
                            />
                        </div>
                        <div className={formStyles['form-group']}>
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={studentData.name}
                                onChange={handleChange}
                                placeholder="Lastname, Firstname Middle..."
                            />
                        </div>
                        <div className={formStyles['form-group']}>
                            <label htmlFor="grade">Grade:</label>
                            <select
                                id="grade"
                                name="grade"
                                value={studentData.grade}
                                onChange={handleChange}
                            >
                                <option value="">Select Grade</option>
                                {grades.map((grade) => (
                                    <option key={grade} value={grade}>
                                        {grade}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={formStyles['form-group']}>
                            <label htmlFor="section">Section:</label>
                            <select
                                id="section"
                                name="section"
                                value={studentData.section}
                                onChange={handleChange}
                                disabled={!studentData.grade} // Disable until grade is selected
                            >
                                <option value="">Select Section</option>
                                {sections.map((section, index) => (
                                    <option key={index} value={section}>
                                        {section}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={formStyles['form-group']}>
                            <label htmlFor="gender">Gender:</label>
                            <select
                                id="gender"
                                name="gender"
                                value={studentData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className={formStyles['form-group']}>
                            <label htmlFor="schoolYear">School Year:</label>
                            <select
                                id="schoolYear"
                                name="schoolYear"
                                value={studentData.schoolYear}
                                onChange={handleChange}
                            >
                                <option value="">Select School Year</option>
                                {schoolYears.map((sy) => (
                                    <option key={sy.schoolYear_ID} value={sy.schoolYear}>
                                        {sy.schoolYear}
                                    </option>
                                ))}
                            </select>
                        </div>
                </form>
            <div className={formStyles['global-buttonGroup']}>
                <button className={formStyles['green-button']} type="submit" onClick={handleSubmit} >Add</button>
                <button className={`${formStyles['green-button']} ${formStyles['red-button']}`}  onClick={onClose}>Cancel</button>

            </div>
            </div>
        </div>,
         document.body
    );
};

export default AddStudentModal;
