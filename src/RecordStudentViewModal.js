import React from 'react';
import styles from './RecordModal.module.css'; // Use the same styles as the other modals

const RecordStudentViewModal = ({ record, onClose }) => {
    if (!record) return null; // Return nothing if there is no record
    return (
        <div className={styles['record-modal-overlay']}>
            <div className={styles['record-modal-content']}>
                <button onClick={onClose} className={styles['closeButton']}>✕</button>
                <h2>Complete Details of Record</h2>
                <div className={styles['record-tableWrapper']}>
                    <table className={styles['record-table']}>
                        <thead>
                            <tr>
                                <th>Record Date</th>
                                <th>Incident Date</th>
                                <th>Monitored Record</th>
                                <th>Remarks</th>
                                <th>Sanction</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{record.record_date}</td>
                                <td>{record.incident_date}</td>
                                <td>{record.monitored_record}</td>
                                <td>{record.remarks}</td>
                                <td>{record.sanction}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecordStudentViewModal;
