import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import styles from './RegisterUserModal.module.css';
import styles1 from '../GlobalForm.module.css';

const UpdateAccountModal = ({ isOpen, onClose, user }) => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = authToken ? JSON.parse(authToken) : null;

    const [userType, setUserType] = useState(null);
    const [updatedUser, setUpdatedUser] = useState({
        username: '',
        password: '',
        firstname: '',
        lastname: '',
        email: '',
        userType: null,
        schoolYear: '',
        grade: null,
        section: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0); // Password strength state

    useEffect(() => {
        if (isOpen && user) {
            setUpdatedUser({
                username: user.username,
                password: '',
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                userType: user.userType,
                schoolYear: user.schoolYear || '',
                grade: user.grade || null,
                section: user.section || ''
            });
            setUserType(user.userType);
        }
    }, [isOpen, user]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUpdatedUser({ ...updatedUser, [name]: value });

        // Update password strength if the password field is changed
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const handleUpdate = () => {
        const updatedData = { ...updatedUser };
    
        // If the password field is empty, remove it from the object to avoid updating
        if (updatedData.password === '') {
            delete updatedData.password;
        } else {
            // Validate password strength
            const passwordStrength = calculatePasswordStrength(updatedData.password);
            const minimumPasswordStrength = 5;
    
            // Check if password strength meets the requirement
            if (passwordStrength < minimumPasswordStrength) {
                alert("Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
                return; // Prevent form submission
            }
        }
    
        const endpoint = updatedUser.userType === 1 ? 'updateSSO' :
                         updatedUser.userType === 2 ? 'updatePrincipal' :
                         updatedUser.userType === 3 ? 'updateAdviser' :
                         updatedUser.userType === 4 ? 'updateAdmin' :
                         updatedUser.userType === 5 ? 'updateTeacher' :
                         updatedUser.userType === 6 ? 'updateGuidance' : '';
    
        if (endpoint) {
            axios.put(`http://localhost:8080/user/${endpoint}`, updatedData)
                .then(response => {
                    console.log(response.data);
                    alert('Account Successfully Updated');
    
                    if (updatedUser.username === loggedInUser.username) {
                        localStorage.setItem('authToken', JSON.stringify(updatedUser));
                    }
                    
                    onClose(); // Close the modal
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                    alert('Error updating account. Please try again.');
                });
        }
    };
    
    // Password strength calculation function
    const calculatePasswordStrength = (password) => {
        let strength = 0;
    
        // Check password length
        if (password.length >= 8) strength += 1; // Minimum length 8
        if (password.length >= 12) strength += 1; // More points for longer
        if (/[A-Z]/.test(password)) strength += 1; // At least one uppercase letter
        if (/[a-z]/.test(password)) strength += 1; // At least one lowercase letter
        if (/[0-9]/.test(password)) strength += 1; // At least one digit
        if (/[\W_]/.test(password)) strength += 1; // At least one special character
    
        return strength; // Return a value from 0 to 6
    };
    

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
                <button className={styles['modal-close-button']} onClick={onClose}>X</button>
                <h2>Update Account</h2>
                <form className={styles1['form-container']}>
                    <div className={styles1['form-group']}>
                        <label>Username:</label>
                        <input type="text" name="username" value={updatedUser.username} onChange={handleInputChange} disabled style={{ cursor: 'not-allowed' }} />
                    </div>
                    <div className={styles1['form-group']}>
                        <label>Password:</label>
                        <input type="password" name="password" value={updatedUser.password} onChange={handleInputChange} />
                    </div>
                    <div className={styles['password-strength-container']}>
                        <div className={styles['password-strength-bar']} style={{ width: `${(passwordStrength / 6) * 100}%`, backgroundColor: passwordStrength === 6 ? 'green' : passwordStrength >= 4 ? 'yellow' : 'red' }} />
                    </div>
                    <p className={styles['password-strength-text']}>
                        {passwordStrength === 0 ? '' :
                            passwordStrength < 3 ? 'Weak' :
                            passwordStrength < 5 ? 'Moderate' : 'Strong'}
                    </p>
                    <div className={styles1['form-group']}>
                        <label>First Name:</label>
                        <input type="text" name="firstname" value={updatedUser.firstname} onChange={handleInputChange} />
                    </div>
                    <div className={styles1['form-group']}>
                        <label>Last Name:</label>
                        <input type="text" name="lastname" value={updatedUser.lastname} onChange={handleInputChange} />
                    </div>
                    <div className={styles1['form-group']}>
                        <label>Email:</label>
                        <input type="email" name="email" value={updatedUser.email} onChange={handleInputChange} />
                    </div>
                    {userType === 3 && (
                        <div>
                            <div className={styles1['form-group']}>
                                <label>School Year:</label>
                                <input type="text" name="schoolYear" value={updatedUser.schoolYear} onChange={handleInputChange} />
                            </div>
                            <div className={styles1['form-group']}>
                                <label>Grade:</label>
                                <input type="number" name="grade" value={updatedUser.grade} onChange={handleInputChange} />
                            </div>
                            <div className={styles1['form-group']}>
                                <label>Section:</label>
                                <input type="text" name="section" value={updatedUser.section} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                    <div className={styles1['global-buttonGroup']}>
                        <button type="button" className={styles1['global-button']} onClick={handleUpdate}>Update</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default UpdateAccountModal;
