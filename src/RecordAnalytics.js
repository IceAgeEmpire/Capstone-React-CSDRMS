import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import styles from './Record.module.css'; // Importing CSS module

const RecordAnalytics = () => {
  const authToken = localStorage.getItem("authToken");
  const loggedInUser = authToken ? JSON.parse(authToken) : null;

  const months = [
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
  ];

  const [lineChartData, setLineChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [schoolYears, setSchoolYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [records, setRecords] = useState([]);
  const [chartType, setChartType] = useState('line'); // Default chart type

  const isAdviser = loggedInUser && loggedInUser.userType === 3;

  useEffect(() => {
    fetchSchoolYears();
    fetchClasses();
    fetchStudentRecords();
  }, []);

  const fetchSchoolYears = async () => {
    try {
      const response = await axios.get('http://localhost:8080/schoolYear/getAllSchoolYears');
      setSchoolYears(response.data);
    } catch (error) {
      console.error('Error fetching school years:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/class/getAllClasses');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudentRecords = async () => {
    try {
      let response;
      if (isAdviser) {
        response = await axios.get('http://localhost:8080/student-record/getStudentRecordsByAdviser', {
          params: {
            grade: loggedInUser.grade,
            section: loggedInUser.section,
            schoolYear: loggedInUser.schoolYear
          }
        });
        setSelectedClass(classes.find(cls => cls.grade === loggedInUser.grade && cls.section === loggedInUser.section));
      } else {
        response = await axios.get('http://localhost:8080/student-record/getAllStudentRecords');
      }

      setRecords(response.data);
      if (response.data.length > 0) {
        processData(response.data, selectedSchoolYear, selectedClass, selectedMonth, selectedWeek);
      }
    } catch (error) {
      console.error('Error fetching student records:', error);
    }
  };

  const processData = (records, schoolYear, classFilter, monthFilter, weekFilter) => {
    const daysInMonth = (month) => new Date(2023, month + 1, 0).getDate();
    const monitoredRecords = ['Absent', 'Tardy', 'Cutting Classes', 'Improper Uniform', 'Offense', 'Misbehavior', 'Clinic'];
    const frequency = {};
    const sanctionCount = new Array(31).fill(0);

    monitoredRecords.forEach(type => {
      frequency[type] = new Array(monthFilter ? daysInMonth(monthFilter) : 10).fill(0);
    });

    records.forEach(record => {
      const recordDate = new Date(record.record_date);
      const month = recordDate.getMonth();
      const year = record.student.schoolYear;
      const grade = record.student.grade;
      const section = record.student.section;

      if ((schoolYear && year !== schoolYear) || 
          (classFilter && (grade !== classFilter.grade || section !== classFilter.section)) ||
          (monthFilter && month !== monthFilter)) return;

      const day = recordDate.getDate() - 1;
      const week = Math.floor(day / 7);

      if (monthFilter) {
        if (weekFilter !== '' && week !== parseInt(weekFilter)) return;

        const monitoredType = record.monitored_record;
        if (frequency[monitoredType]) {
          frequency[monitoredType][day]++;
        }
        if (record.sanction && record.sanction.trim() !== '') {
          sanctionCount[day]++;
        }
      } else if (month >= 7 || month <= 4) {
        const monthIndex = (month >= 7) ? month - 7 : month + 5;
        const monitoredType = record.monitored_record;

        if (frequency[monitoredType]) {
          frequency[monitoredType][monthIndex]++;
        }

        if (record.sanction && record.sanction.trim() !== '') {
          sanctionCount[monthIndex]++;
        }
      }
    });

    // Create Line Chart Data
    const lineData = {
      labels: monthFilter ? Array.from({ length: daysInMonth(monthFilter) }, (_, i) => i + 1) : months.map(m => m.label),
      datasets: [
        ...monitoredRecords.map((type, index) => ({
          label: type,
          data: frequency[type],
          borderColor: getColor(index),
          fill: false,
          tension: 0.1
        })),
        {
          label: 'Sanctions',
          data: sanctionCount,
          borderColor: 'rgba(0, 0, 0, 1)',
          fill: false,
          tension: 0.1
        }
      ]
    };

    // Create Bar Chart Data
    const barData = {
      labels: monthFilter ? Array.from({ length: daysInMonth(monthFilter) }, (_, i) => i + 1) : months.map(m => m.label),
      datasets: [
        ...monitoredRecords.map((type, index) => ({
          label: type,
          data: frequency[type],
          backgroundColor: getColor(index),
        })),
        {
          label: 'Sanctions',
          data: sanctionCount,
          backgroundColor: 'rgba(0, 0, 0, 1)',
        }
      ]
    };

    // Create Pie Chart Data
    const pieData = {
      labels: [...monitoredRecords, 'Sanctions'], // Add 'Sanctions' to the labels
      datasets: [{
        data: [
          ...monitoredRecords.map(type => frequency[type].reduce((a, b) => a + b, 0)), // Total counts of monitored records
          sanctionCount.reduce((a, b) => a + b, 0) // Total count of sanctions
        ],
        backgroundColor: [
          ...monitoredRecords.map((_, index) => getColor(index)), // Colors for monitored records
          'rgba(0, 0, 0, 1)', // Color for sanctions
        ],
      }]
    };

    // Set chart data states
    setLineChartData(lineData);
    setBarChartData(barData);
    setPieChartData(pieData);
  };

  const getColor = (index) => {
    const colors = [
      'rgba(255, 0, 0, 1)', // Red
      'rgba(255, 127, 0, 1)', // Orange
      'rgba(255, 255, 0, 1)', // Yellow
      'rgba(0, 255, 0, 1)', // Green
      'rgba(0, 0, 255, 1)', // Blue
      'rgba(75, 0, 130, 1)', // Indigo
      'rgba(148, 0, 211, 1)', // Violet
      'rgba(0, 0, 0, 1)', // Black
    ];
    return colors[index % colors.length];
  };

  const handleSchoolYearChange = (event) => {
    const newSchoolYear = event.target.value;
    setSelectedSchoolYear(newSchoolYear);
    processData(records, newSchoolYear, selectedClass, selectedMonth, selectedWeek);
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    const selectedClass = classes.find(cls => cls.class_id === parseInt(classId));
    setSelectedClass(selectedClass);
    processData(records, selectedSchoolYear, selectedClass, selectedMonth, selectedWeek);
  };

  const handleMonthChange = (event) => {
    const month = event.target.value === '' ? '' : parseInt(event.target.value);
    setSelectedMonth(month);
    setSelectedWeek(''); // Reset week when month changes
    processData(records, selectedSchoolYear, selectedClass, month, ''); // Pass empty string for week
  };

  const handleWeekChange = (event) => {
    const week = event.target.value;
    setSelectedWeek(week);
    processData(records, selectedSchoolYear, selectedClass, selectedMonth, week);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  if (!lineChartData || !barChartData || !pieChartData) {
    return <div class="dot-spinner">
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
      <div class="dot-spinner__dot"></div>
    </div>
  }

  // Pie Chart Options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows custom sizing of the container
    plugins: {
      legend: { position: 'right' },
      title: {
        display: true,
        text: 'Distribution of Monitored Records by Category (Pie Chart)',
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: selectedMonth
          ? `Monitored Records for ${months.find((m) => m.value === selectedMonth)?.label || ''} (Bar Chart)`
          : 'Monitored Records by Month (Bar Chart)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Frequency' },
        ticks: {
          callback: function(value) {
            return Number.isInteger(value) ? value : ''; // Show integer values only
          },
        },
      },
      x: { title: { display: true, text: selectedMonth ? 'Days of the Month' : 'Categories' } },
    },
  };

  // Line Chart Options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: selectedMonth
          ? `Monitored Records for ${months.find((m) => m.value === selectedMonth)?.label || ''} (Line Chart)`
          : 'Monitored Records by Month (Line Chart)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Frequency' },
        ticks: {
          callback: function(value) {
            return Number.isInteger(value) ? value : ''; // Show integer values only
          },
        },
      },
      x: { title: { display: true, text: selectedMonth ? 'Days of the Month' : 'Months' } },
    },
  };

  // Conditionally render the chart based on selected chart type
  const renderChart = () => {
    return (
      <div className={styles.chartContainer}> {/* This will apply the centering styles */}
        {(() => {
          switch (chartType) {
            case 'bar':
              return (
                <div className={styles['barchart-Container']}>
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              );
            case 'pie':
              return (
                <div className={styles['pieChart-Container']}>
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              );
            case 'line':
            default:
              return (
                <div className={styles['linechart-Container']}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              );
          }
        })()}
      </div>
    );
  };


  return (
    <div>
      <h2 className={styles.RecordTitle}>Analytics Overview</h2>
      <div className={styles['filterContainer']}>
        <label>Filters:
          {!isAdviser && (
            <select id="schoolYearSelect" value={selectedSchoolYear} onChange={handleSchoolYearChange}>
              <option value="">All School Years</option>
              {schoolYears.map((year) => (
                <option key={year.id} value={year.schoolYear}>{year.schoolYear}</option>
              ))}
            </select>
          )}

          <select id="classSelect" value={isAdviser ? `${loggedInUser.grade} - ${loggedInUser.section}` : (selectedClass?.class_id || '')} onChange={handleClassChange} disabled={isAdviser}>
            {isAdviser ? (
              <option value={`${loggedInUser.grade} - ${loggedInUser.section}`}>
                {`${loggedInUser.grade} - ${loggedInUser.section}`}
              </option>
            ) : (
              <option value="">All Classes</option>
            )}
            {classes.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>{`${cls.grade} - ${cls.section}`}</option>
            ))}
          </select>

          <select id="monthSelect" value={selectedMonth || ''} onChange={handleMonthChange}>
            <option value="">All Months</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>

          {selectedMonth && (
            <select id="weekSelect" value={selectedWeek} onChange={handleWeekChange}>
              <option value="">All Weeks</option>
              <option value="0">Week 1</option>
              <option value="1">Week 2</option>
              <option value="2">Week 3</option>
              <option value="3">Week 4</option>
              <option value="4">Week 5</option>
            </select>
          )}

          <select value={chartType} onChange={handleChartTypeChange}>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </label>
      </div>

      {renderChart()}
    </div>
  );
};

export default RecordAnalytics;
