import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import axios from "axios";
import classStyles from './Class.module.css';
import navStyles from '../Navigation.module.css';
import Navigation from '../Navigation';
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon

const Class = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = authToken ? JSON.parse(authToken) : null;

    const [classes, setClasses] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [newGrade, setNewGrade] = useState(null); // Change to null
    const [newSection, setNewSection] = useState("");
    const [newSchoolYear, setNewSchoolYear] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddClass, setShowAddClass] = useState(false);
    const [showAddSchoolYear, setShowAddSchoolYear] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleOpen = () => setShowAddClass(true);
    const handleClose = () => setShowAddClass(false);
    const handleOpenSchoolYear = () => setShowAddSchoolYear(true);
    const handleCloseSchoolYear = () => setShowAddSchoolYear(false);

    useEffect(() => {
        document.title = "Admin | Class";
        const fetchData = async () => {
            await Promise.all([fetchClasses(), fetchSchoolYears()]);
            setLoading(false);
        };
        fetchData();
    }, [loggedInUser]);

    const fetchClasses = async () => {
        try {
            const response = await axios.get("http://localhost:8080/class/getAllClasses");
            setClasses(response.data);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const fetchSchoolYears = async () => {
        try {
            const response = await axios.get("http://localhost:8080/schoolYear/getAllSchoolYears");
            setSchoolYears(response.data);
        } catch (error) {
            console.error("Error fetching school years:", error);
        }
    };

    const addClass = async () => {
    if (!newGrade || !newSection) {
        alert("Please fill in all fields");
        return;
    }

    // Check if the combination of grade and section already exists
    const classExists = classes.some(classItem => 
        classItem.grade === newGrade && classItem.section === newSection
    );
    
    if (classExists) {
        alert("Class already exists");
        return;
    }

    try {
        await axios.post("http://localhost:8080/class/addClass", {
            grade: newGrade,
            section: newSection,
        });
        await fetchClasses();
        handleClose();
    } catch (error) {
        console.error("Error adding grade:", error);
        alert("Failed to add grade and section");
    }
};


    const addSchoolYear = async () => {
        if (!newSchoolYear) {
            alert("Please fill in all fields");
            return;
        }

        const schoolYearExists = schoolYears.some(schoolYear => schoolYear.schoolYear === newSchoolYear);
        if (schoolYearExists) {
            alert("School year already exists");
            return;
        }

        try {
            await axios.post("http://localhost:8080/schoolYear/addSchoolYear", {
                schoolYear: newSchoolYear,
            });
            await fetchSchoolYears();
            handleCloseSchoolYear();
        } catch (error) {
            console.error("Error adding school year:", error);
            alert("Failed to add school year");
        }
    };

    const deleteClass = async (classId, grade, section) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this class? " +grade+ "-" +section+ "?" );
      if (confirmDelete) {
          try {
              await axios.delete(`http://localhost:8080/class/deleteClass/${classId}`);
              await fetchClasses(); // Refresh the list after deletion
          } catch (error) {
              console.error("Error deleting class:", error);
              alert("Failed to delete class");
          }
      }
  };

  const deleteSchoolYear = async (schoolYearId,schoolYear) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this school year: " +schoolYear + "?" );
      if (confirmDelete) {
          try {
              await axios.delete(`http://localhost:8080/schoolYear/deleteSchoolYear/${schoolYearId}`);
              await fetchSchoolYears(); // Refresh the list after deletion
          } catch (error) {
              console.error("Error deleting school year:", error);
              alert("Failed to delete school year");
          }
      }
  };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const filteredClasses = classes
    .filter(classItem => 
        classItem.grade === newGrade || classItem.section?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.grade - b.grade); // Sort numerically


    const filteredSchoolYears = schoolYears.filter(schoolYear => schoolYear.schoolYear?.includes(searchTerm));

    if (loading) 
        return <div className='center'>
            <div className="loading">
                <div class="slide"><i></i></div>
                <div class="paper"></div>
                <div class="keyboard"></div>
            </div>
            <p className='period' >Loading...</p>
        </div>
    return (
        <div className={navStyles.wrapper}>
            <Navigation loggedInUser={loggedInUser} />

            {/* Main Content */}
            <div className={navStyles.content}>
                <div className={navStyles['h1-title']}>Class Management</div>
                <div className={classStyles.divide}>
                    <div className={classStyles.tableContainer}>
                        <div className={classStyles.table}>
                            <table className={classStyles.tableInner}>
                                <thead>
                                    <tr>
                                        <th>Grade & Section</th>
                                        <th>Actions</th> {/* New column for actions */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClasses.length > 0 ? (
                                        filteredClasses.map(classItem => (
                                            <tr key={classItem.class_id}>
                                                <td>{`${classItem.grade} - ${classItem.section}`}</td>
                                                <td>
                                                    <DeleteIcon 
                                                        onClick={() => deleteClass(classItem.class_id, classItem.grade, classItem.section)} 
                                                        style={{ cursor: 'pointer', color: 'red' }} 
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className={classStyles.noresult} colSpan="2">No Results Found...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={classStyles.tableContainer}>
                        <div className={classStyles.table}>
                            <table className={classStyles.tableInner}>
                                <thead>
                                    <tr>
                                        <th>School Year</th>
                                        <th>Actions</th> {/* New column for actions */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSchoolYears.length > 0 ? (
                                        filteredSchoolYears.map(schoolYear => (
                                            <tr key={schoolYear.schoolYear_ID}>
                                                <td>{schoolYear.schoolYear}</td>
                                                <td>
                                                    <DeleteIcon 
                                                        onClick={() => deleteSchoolYear(schoolYear.schoolYear_ID,schoolYear.schoolYear)} 
                                                        style={{ cursor: 'pointer', color: 'red' }} 
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className={classStyles.noresult} colSpan="2">No Results Found...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Add Grade Modal */}
                <Modal open={showAddClass} onClose={handleClose}>
                    <Box className={classStyles.modalContainer}>
                        <h2 className={classStyles.modalHeader}>Add New Grade & Section</h2>
                        <div className={classStyles['class-container']}>
                            <div className={classStyles['class-group']}>
                                <label className={classStyles['classgroup-label']}>Grade: </label>
                                <select 
                                    className={classStyles['classgroup-input']} 
                                    value={newGrade} 
                                    onChange={e => setNewGrade(Number(e.target.value))} // Convert to integer
                                    id="grade"
                                    name="grade"
                                >
                                    <option value="">Select Grade</option>
                                    <option value={7}>Grade 7</option>
                                    <option value={8}>Grade 8</option>
                                    <option value={9}>Grade 9</option>
                                    <option value={10}>Grade 10</option>
                                </select>
                            </div>
                            <div className={classStyles['class-group']}>
                                <label className={classStyles['classgroup-label']}>Section: </label>
                                <input
                                    className={classStyles['classgroup-input']}
                                    type="section"
                                    placeholder="Enter Section"
                                    value={newSection}
                                    onChange={e => setNewSection(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={classStyles.buttonGroup}>
                            <button onClick={addClass} className={classStyles.button}>Add</button>
                            <button onClick={handleClose} className={`${classStyles.button} ${classStyles.buttonCancel}`}>Cancel</button>
                        </div>
                    </Box>
                </Modal>

                {/* Add School Year Modal */}
                <Modal open={showAddSchoolYear} onClose={handleCloseSchoolYear}>
                    <Box className={classStyles.modalContainer}>
                        <h2 className={classStyles.modalHeader}>Add New School Year</h2>
                        <div className={classStyles['class-container']}>
                            <div className={classStyles['class-group']}>
                                <label className={classStyles['classgroup-label-year']}>School Year: </label>
                                <input
                                    className={classStyles['classgroup-input-year']}                    
                                    type="year"
                                    placeholder="Enter School Year"
                                    value={newSchoolYear}
                                    onChange={e => setNewSchoolYear(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={classStyles.buttonGroup}>
                            <button onClick={addSchoolYear} className={classStyles.button}>Add</button>
                            <button onClick={handleCloseSchoolYear} className={`${classStyles.button} ${classStyles.buttonCancel}`}>Cancel</button>
                        </div>
                    </Box>
                </Modal>

                <div className={classStyles.addButtonContainer}>
                    <button onClick={handleOpen} className={classStyles.button}>Add Class</button>
                    <button onClick={handleOpenSchoolYear} className={classStyles.button}>Add School Year</button>
                    <div className={classStyles.searchContainer}>
                        <input
                            type="search"
                            placeholder="Search by Class..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className={classStyles.searchInput}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Class;
