import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdviserTimeLogModal.module.css';

const AdviserTimeLogModal = ({ adviser, onClose }) => {
    const [adviserTimeLogs, setAdviserTimeLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loginCount, setLoginCount] = useState(0); 
    const [totalDuration, setTotalDuration] = useState(0);

    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedWeek, setSelectedWeek] = useState('all');

    useEffect(() => {
        const fetchAdviserTimeLogs = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/time-log/getAllTimelogsByAdviser/${adviser.uid}`);
                setAdviserTimeLogs(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch adviser time logs');
                console.error(err);
            }
        };

        fetchAdviserTimeLogs();
    }, [adviser.uid]);

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
        setSelectedWeek('all'); // Reset the week when the month changes
    };

    const handleWeekChange = (event) => {
        setSelectedWeek(event.target.value);
    };

    const filteredTimeLogs = adviserTimeLogs.filter(log => {
        const logDate = new Date(log.loginTime);

        if (selectedYear !== 'all' && logDate.getFullYear() !== parseInt(selectedYear)) {
            return false;
        }

        if (selectedMonth !== 'all' && logDate.getMonth() + 1 !== parseInt(selectedMonth)) {
            return false;
        }

        if (selectedMonth !== 'all' && selectedWeek !== 'all') {
            const weekOfMonth = Math.ceil(logDate.getDate() / 7);
            if (weekOfMonth.toString() !== selectedWeek) {
                return false;
            }
        }

        return true;
    });

    const totalLogins = filteredTimeLogs.length;
    const totalDurationFiltered = filteredTimeLogs.reduce((acc, log) => acc + log.duration, 0);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className={styles['timelog-modal-overlay']} onClick={onClose}>
            <div className={styles['timelog-modal-content']} onClick={e => e.stopPropagation()}>
                <button className={styles['timelog-close-button']} onClick={onClose}>X</button>
                <h2 className={styles['timelog-title']}>{adviser.firstname} {adviser.lastname}'s Time Logs</h2>

                <div className={styles['timelog-filters']}>
                    <div className={styles['filter-item']}>
                        <label className={styles['filter-timelog-label']}>
                            Year:
                            <select className={styles['select-timelog']} value={selectedYear} onChange={handleYearChange}>
                                <option value="all">All</option>
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                            </select>
                        </label>
                    </div>

                    <div className={styles['filter-item']}>
                        <label label className={styles['filter-timelog-label']}>
                            Month:
                            <select className={styles['select-timelog']} value={selectedMonth} onChange={handleMonthChange}>
                                <option value="all">All</option>
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                        </label>
                    </div>

                    {selectedMonth !== 'all' && (
                        <div className={styles['filter-item']}>
                            <label label className={styles['filter-timelog-label']}>
                                Week:
                                <select className={styles['select-timelog']} value={selectedWeek} onChange={handleWeekChange}>
                                    <option value="all">All</option>
                                    <option value="1">Week 1</option>
                                    <option value="2">Week 2</option>
                                    <option value="3">Week 3</option>
                                    <option value="4">Week 4</option>
                                </select>
                            </label>
                        </div>
                    )}
                </div>

                <div className={styles['timelog-duration']}>
                    <div>Total Logins: {totalLogins}</div>
                    <div>Total Duration: {totalDurationFiltered} minute/s</div>                    
                </div>    

                <div className={styles['timelog-center-container']}>
                    <div className={styles['timelog-table-container']}>
                        <table className={styles['timelog-table']}>
                            <thead>
                                <tr>
                                    <th>Login Time</th>
                                    <th>Logout Time</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTimeLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className={styles['timelog-no-results']} style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                                            No Results Found...
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTimeLogs.map(log => (
                                        <tr key={log.timelog_id}>
                                            <td>{new Date(log.loginTime).toLocaleString()}</td>
                                            <td>{log.logoutTime ? new Date(log.logoutTime).toLocaleString() : 'Not logged out yet'}</td>
                                            <td>{log.duration} minute/s</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdviserTimeLogModal;
