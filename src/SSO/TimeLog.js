import React, { useState, useEffect } from 'react';
/* import { useNavigate } from 'react-router-dom'; */
import axios from 'axios';
import styles from './TimeLog.module.css'; 
import navStyles from '../Navigation.module.css'; 
import Navigation from '../Navigation'; // Importing the updated Navigation component
import AdviserTimeLogModal from './AdviserTimeLogModal'; // Import the modal

const TimeLog = () => {
    const [advisers, setAdvisers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdviser, setSelectedAdviser] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const { uid } = loggedInUser;
    /*const navigate = useNavigate();*/

    // Set the document title for the Time Log page
    useEffect(() => {
        document.title = "SSO | Time Log";
    }, []); // Empty dependency array ensures this runs once when the component mounts

    useEffect(() => {
        const fetchAdvisers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/user/getAllAdvisers');
                setAdvisers(response.data);
            } catch (err) {
                setError('Failed to fetch advisers');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdvisers();
    }, []);

    const openModal = () => {
        if (selectedAdviser) {
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setSelectedAdviser(null);
        setIsModalOpen(false);
        setSelectedRow(null);
    };

    // Filter advisers based on search query
    const filteredAdvisers = advisers.filter(adviser => {
        const fullName = `${adviser.firstname} ${adviser.middlename || ''} ${adviser.lastname}`.toLowerCase();
        const gradeSection = `${adviser.grade} - ${adviser.section}`.toLowerCase();
        const email = adviser.email.toLowerCase();

        const queryLower = searchQuery.toLowerCase();
        return (
            fullName.includes(queryLower) ||
            gradeSection.includes(queryLower) ||
            email.includes(queryLower)
        );
    });

    const handleRowClick = (adviser, index) => {
        setSelectedAdviser(adviser);
        setSelectedRow(index);
    };

    if (loading) 
        return <div className='center'>
            <div className="loading">
                <div class="slide"><i></i></div>
                <div class="paper"></div>
                <div class="keyboard"></div>
            </div>
            <p className='period' >Loading...</p>
        </div>
    if (error) return <div>{error}</div>;

    return (
        <div className={navStyles.wrapper}>
            <Navigation loggedInUser={loggedInUser} />          

            <div className={navStyles.content}>
                <div className={navStyles.TitleContainer} style={{ justifyContent: 'space-between' }}>
                    <h2 className={navStyles['h1-title']}>Time Log</h2>
                    <div className={styles['logfilter-search-bar']}>
                        <input
                            type="search"
                            className={styles['logsearchRec']}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Name, Grade, Section, or Email..."
                        />
                    </div>  
                </div>
                <div className={styles['time-center-container']}>
                    <div className={styles['time-table-container']}>
                        <table className={styles['time-table']}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Grade & Section</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdvisers.length > 0 ? (
                                    filteredAdvisers.map((adviser, index) => (
                                        <tr 
                                            key={adviser.adviser_id} 
                                            onClick={() => handleRowClick(adviser, index)}
                                            className={selectedRow === index ? styles['log-selected-row'] : ''}
                                        >
                                            <td>{`${adviser.firstname} ${adviser.middlename ? adviser.middlename + ' ' : ''}${adviser.lastname}`}</td>
                                            <td>{`${adviser.grade} - ${adviser.section}`}</td>
                                            <td>{`${adviser.email}`}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className={styles['log-no-results']} style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                                            No Results Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>                     
                <div className={styles['log-buttons']}>                  
                    <div className={styles['button-container']}>
                        <button 
                            className={styles.viewlogButton} 
                            onClick={openModal} 
                            disabled={!selectedAdviser}
                        >
                            View
                        </button>
                    </div>
                    
                </div>               
            </div>

            {isModalOpen && (
                <AdviserTimeLogModal 
                    adviser={selectedAdviser} 
                    onClose={closeModal} 
                />
            )}
        </div>
    );
};

export default TimeLog;
