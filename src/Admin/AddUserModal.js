import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './AddUserModal.module.css'; // Import updated CSS module
import RegisterUserModal from './RegisterUserModal'; // Import consolidated RegisterUserModal

const AddUserModal = ({ isOpen, onClose }) => {
    const [activeRole, setActiveRole] = useState(null);

    if (!isOpen) return null;

    const handleOpenModal = (role) => {
        setActiveRole(role);
    };

    const handleCloseModal = () => {
        setActiveRole(null);
        onClose();
    };

    return ReactDOM.createPortal(
        <div className={styles['add-user-modal-overlay']} onClick={handleCloseModal}>
            <div className={styles['add-user-modal-content']} onClick={e => e.stopPropagation()}>
                <button className={styles['modal-close-button']} onClick={handleCloseModal}>X</button>
                <h2>Create User</h2>
                <form>
                    <button
                        type="button"
                        className={styles['add-user-modal-button']}
                        onClick={() => handleOpenModal('SSO')}
                    >
                        SSO Officer
                    </button>
                    <button
                        type="button"
                        className={styles['add-user-modal-button']}
                        onClick={() => handleOpenModal('Principal')}
                    >
                        Principal
                    </button>
                    <button
                        type="button"
                        className={styles['add-user-modal-button']}
                        onClick={() => handleOpenModal('Adviser')}
                    >
                        Adviser
                    </button>
                    <button
                        type="button"
                        className={styles['add-user-modal-button']}
                        onClick={() => handleOpenModal('Teacher')}
                    >
                        Teacher
                    </button>
                    <button
                        type="button"
                        className={styles['add-user-modal-button']}
                        onClick={() => handleOpenModal('Guidance')}
                    >
                        Guidance
                    </button>
                </form>
                {activeRole && (
                    <RegisterUserModal
                        isOpen={true}
                        onClose={handleCloseModal}
                        role={activeRole}
                    />
                )}
            </div>
        </div>,
        document.body
    );
};

export default AddUserModal;
