import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Profile icon
import IconButton from '@mui/material/IconButton'; // Profile icon
import UpdateAccountModal from '../Admin/UpdateAccountModal'; // Import the UpdateAccountModal
import navStyles from '../Navigation.module.css'; // Import the CSS module

const MenuPopupState = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = authToken ? JSON.parse(authToken) : null;
    const navigate = useNavigate();
    const [isModalOpen, setModalOpen] = useState(false); // State for modal visibility

    // Check if the user is logged in
    if (!loggedInUser) {
        console.error('User is not logged in');
        navigate('/login'); // Navigate to login page if not logged in
        return null;
    }

    const user = loggedInUser;
    const { uid } = user;

    // User type label for display purposes
    const userTypeLabel = `${user.lastname || 'User'} ${user.userType === 1 ? " | SSO Officer" : 
                                           user.userType === 2 ? " | Principal" : 
                                           user.userType === 3 ? " | Adviser" : 
                                           user.userType === 4 ? " | Admin" : " | User"}`;

    // Handle user logout and remove auth token
    const handleLogout = async () => {
        const userType = user.userType;

        if (userType !== 3) {
            localStorage.removeItem('authToken');
            navigate('/');
            return;
        }

        try {
            const logoutTime = new Date().toISOString();
            const response = await axios.get(`http://localhost:8080/time-log/getLatestLog/${uid}`);
            const { timelog_id: timelogId } = response.data;

            await axios.post('http://localhost:8080/time-log/logout', {
                timelogId,
                logoutTime,
            });

            localStorage.removeItem('authToken');
            navigate('/');
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    // Open profile update modal
    const handleProfileClick = () => {
        setModalOpen(true); // Open the modal
        
    };

    // Close profile update modal
    const handleModalClose = () => {
        setModalOpen(false); // Close the modal c h ec k p o i n t
        
    };

    return (
        <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
                <React.Fragment>
                    <IconButton
                        {...bindTrigger(popupState)} 
                    >
                        <AccountCircleIcon className={navStyles['header-icon']} />
                    </IconButton>
                    <Menu {...bindMenu(popupState)}>
                        <MenuItem onClick={handleProfileClick}>Update Account</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                    <UpdateAccountModal isOpen={isModalOpen} onClose={handleModalClose} user={user}  /> {/* Include the modal */}
                </React.Fragment>
            )}
        </PopupState>
    );
};

export default MenuPopupState;
