import React, { useEffect, useState } from 'react';
import axios from 'axios';
import tableStyles from './GlobalTable.module.css'; // Import the CSS module
import styles from './Record.module.css'; // Importing CSS module

const RecordTable = () => {
    const authToken = localStorage.getItem("authToken");
    const loggedInUser = authToken ? JSON.parse(authToken) : null;
    const [records, setRecords] = useState([]);
    const [classes, setClasses] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedWeek, setSelectedWeek] = useState('');

    useEffect(() => {
        const fetchClasses = async () => {
            const response = await axios.get('http://localhost:8080/class/getAllClasses');
            setClasses(response.data);
        };

        const fetchSchoolYears = async () => {
            const response = await axios.get('http://localhost:8080/schoolYear/getAllSchoolYears');
            setSchoolYears(response.data);
        };

        fetchClasses();
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        if (loggedInUser && loggedInUser.userType === 3) {
            const userGrade = loggedInUser.grade;
            const userSection = loggedInUser.section;

            setSelectedClass(`${userGrade}${userSection}`);
            setSelectedSchoolYear('');
        }
    }, [loggedInUser]);

    useEffect(() => {
        const fetchRecords = async () => {
            let response;
            if (loggedInUser && loggedInUser.userType === 3) {
                const grade = loggedInUser.grade;
                const section = loggedInUser.section;
                const schoolYear = loggedInUser.schoolYear;

                response = await axios.get(
                    `http://localhost:8080/student-record/getStudentRecordsByAdviser`,
                    { params: { grade, section, schoolYear } }
                );
            } else {
                response = await axios.get('http://localhost:8080/student-record/getAllStudentRecords');
            }
            setRecords(response.data);
        };

        fetchRecords();
    }, [selectedClass, selectedSchoolYear, loggedInUser]);

    const handleClassChange = (event) => {
        setSelectedClass(event.target.value);
    };

    const handleSchoolYearChange = (event) => {
        setSelectedSchoolYear(event.target.value);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
        setSelectedWeek('');
    };

    const handleWeekChange = (event) => {
        setSelectedWeek(event.target.value);
    };

    const filteredRecords = records.filter(record => {
        const matchesClass = selectedClass ? (record.student.grade + record.student.section === selectedClass) : true;
        const matchesMonth = selectedMonth ? (new Date(record.record_date).getMonth() + 1) === parseInt(selectedMonth) : true;
        const matchesWeek = selectedWeek ? Math.ceil(new Date(record.record_date).getDate() / 7) === parseInt(selectedWeek) : true;
        const matchesSchoolYear = selectedSchoolYear ? record.student.schoolYear === selectedSchoolYear : true;

        return matchesClass && matchesMonth && matchesWeek && matchesSchoolYear;
    });

    const groupedRecords = {};
    filteredRecords.forEach(record => {
        const gradeSection = `${record.student.grade} - ${record.student.section}`; // Combine grade and section
        if (!groupedRecords[gradeSection]) {
            groupedRecords[gradeSection] = {
                Absent: 0,
                Tardy: 0,
                'Cutting Classes': 0,
                'Improper Uniform': 0,
                Offense: 0,
                Misbehavior: 0,
                Clinic: 0,
                SanctionFrequency: 0,
            };
        }
        groupedRecords[gradeSection][record.monitored_record]++;
        if (record.sanction) {
            groupedRecords[gradeSection].SanctionFrequency++;
        }
    });

    // New: Create a mapping of student records with their counts
    const studentRecords = {};
    filteredRecords.forEach(record => {
        const studentName = record.student.name;
        if (!studentRecords[studentName]) {
            studentRecords[studentName] = {
                Absent: 0,
                Tardy: 0,
                'Cutting Classes': 0,
                'Improper Uniform': 0,
                Offense: 0,
                Misbehavior: 0,
                Clinic: 0,
                SanctionFrequency: 0,
            };
        }
        studentRecords[studentName][record.monitored_record]++;
        if (record.sanction) {
            studentRecords[studentName].SanctionFrequency++;
        }
    });

    return (
        <div>
            <h2 className={styles.RecordTitle}>Table Overview</h2>
            <div className={styles['filterContainer']}>
                <label>Filters:
                    {loggedInUser && loggedInUser.userType !== 3 && (
                        <>
                            <select id="schoolyear-select" value={selectedSchoolYear} onChange={handleSchoolYearChange}>
                                <option value="">All School Years</option>
                                {schoolYears.map((sy) => (
                                    <option key={sy.schoolYear_ID} value={sy.schoolYear}>
                                        {sy.schoolYear}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    {loggedInUser.userType !== 3 && (
                        <select id="class-select" value={selectedClass} onChange={handleClassChange} disabled={loggedInUser && loggedInUser.userType === 3}>
                            <option value="">All Classes</option>
                            {classes.map((classEntity) => (
                                <option key={classEntity.class_id} value={classEntity.grade + classEntity.section}>
                                    {classEntity.grade} - {classEntity.section}
                                </option>
                            ))}
                        </select>
                    )}

                    <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
                        <option value="">All Months</option>
                        {[
                            { value: 8, label: 'August' },
                            { value: 9, label: 'September' },
                            { value: 10, label: 'October' },
                            { value: 11, label: 'November' },
                            { value: 12, label: 'December' },
                            { value: 1, label: 'January' },
                            { value: 2, label: 'February' },
                            { value: 3, label: 'March' },
                            { value: 4, label: 'April' },
                            { value: 5, label: 'May' },
                        ].map(month => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>

                    {selectedMonth && (
                        <>
                            <select id="week-select" value={selectedWeek} onChange={handleWeekChange}>
                                <option value="">All Weeks</option>
                                {[1, 2, 3, 4, 5].map(week => (
                                    <option key={week} value={week}>{`Week ${week}`}</option>
                                ))}
                            </select>
                        </>
                    )}
                </label>
            </div>
            <div className={tableStyles['table-container']}>
                <table className={tableStyles['table-overview']}>
                    <thead>
                        <tr>
                            <th>Class</th>
                            <th>Absent</th>
                            <th>Tardy</th>
                            <th>Cutting Classes</th>
                            <th>Improper Uniform</th>
                            <th>Offense</th>
                            <th>Misbehavior</th>
                            <th>Clinic</th>
                            <th>Sanction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedRecords).length > 0 ? (
                            Object.entries(groupedRecords).map(([gradeSection, counts]) => (
                                <tr key={gradeSection}>
                                    <td>{gradeSection}</td>
                                    <td>{counts.Absent}</td>
                                    <td>{counts.Tardy}</td>
                                    <td>{counts['Cutting Classes']}</td>
                                    <td>{counts['Improper Uniform']}</td>
                                    <td>{counts.Offense}</td>
                                    <td>{counts.Misbehavior}</td>
                                    <td>{counts.Clinic}</td>
                                    <td>{counts.SanctionFrequency}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center' }}>
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedClass && (
                <>                
                    {/* New Table for Students */}
                    <h2 className={styles.RecordTitle}>Students Overview</h2>
                    <div className={tableStyles['table-container']}>
                        <table className={tableStyles['table-overview']}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Absent</th>
                                    <th>Tardy</th>
                                    <th>Cutting Classes</th>
                                    <th>Improper Uniform</th>
                                    <th>Offense</th>
                                    <th>Misbehavior</th>
                                    <th>Clinic</th>
                                    <th>Sanction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(studentRecords).length > 0 ? (
                                    Object.entries(studentRecords).map(([studentName, counts]) => (
                                        <tr key={studentName}>
                                            <td>{studentName}</td>
                                            <td>{counts.Absent}</td>
                                            <td>{counts.Tardy}</td>
                                            <td>{counts['Cutting Classes']}</td>
                                            <td>{counts['Improper Uniform']}</td>
                                            <td>{counts.Offense}</td>
                                            <td>{counts.Misbehavior}</td>
                                            <td>{counts.Clinic}</td>
                                            <td>{counts.SanctionFrequency}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center' }}>
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecordTable;
