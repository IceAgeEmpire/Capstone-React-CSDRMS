import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navigation.module.css";
import Navigation from './Navigation';
import axios from "axios";

const Notification = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");
  const loggedInUser = authToken ? JSON.parse(authToken) : null;
  const [suspensions, setSuspensions] = useState([]);
  const [error, setError] = useState(null);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login');
    }
  }, [loggedInUser, navigate]);

  // Fetch suspensions based on user type
  useEffect(() => {
    const fetchSuspensions = async () => {
      try {
        let response;
        
        // Check if userType is 3 (Adviser), then fetch by section and schoolYear
        if (loggedInUser.userType === 3) {
          response = await axios.get('http://localhost:8080/suspension/getAllSuspensionsBySectionAndSchoolYear', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            params: {
              section: loggedInUser.section, // Adviser’s section
              schoolYear: loggedInUser.schoolYear, // Adviser’s school year
            },
          });
        } else {
          // Fetch all suspensions for other user types
          response = await axios.get('http://localhost:8080/suspension/getAllSuspensions', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
        }

        setSuspensions(response.data); // Set suspensions data
      } catch (err) {
        console.error("Error fetching suspensions:", err);
        setError("Failed to load suspensions.");
      }
    };

    fetchSuspensions(); // Call the function to fetch suspensions when component mounts
  }, [authToken, loggedInUser]);

  return (
    <div className={styles.wrapper}>
      <Navigation loggedInUser={loggedInUser} /> {/* Assuming you have this component */}

      <div className={styles.content}>
        <div className={styles['h1-title']}>Notifications</div>

        {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error message if any */}

        {/* Render suspensions */}
        {suspensions.length > 0 ? (
          <ul>
            {suspensions.map((suspension) => (
              <li key={suspension.suspensionId}>
                <b>Date Submitted:</b> {suspension.dateSubmitted} <br />
                <b>Student:</b> {suspension.reportEntity.student.name} <br />
                <b>Days Suspended:</b> {suspension.days} <br />
                <b>Start Date:</b> {suspension.startDate} <br />
                <b>End Date:</b> {suspension.endDate} <br />
                <b>Return Date:</b> {suspension.returnDate} <br />
                <b>Offense/s Commited</b> {suspension.reportEntity.complaint} <br />
              </li>
            ))}
          </ul>
        ) : (
          <p>No suspensions found.</p>
        )}
      </div>
    </div>
  );
};

export default Notification;
