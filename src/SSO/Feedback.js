import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import navStyles from "../Navigation.module.css"; // Import CSS module for navigation
import styles from "./Feedback.module.css"; // Import CSS module for feedback content

import AccountBoxIcon from "@mui/icons-material/AccountBox";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PostAddIcon from "@mui/icons-material/PostAdd";
import RateReviewIcon from "@mui/icons-material/RateReview";
import SchoolIcon from "@mui/icons-material/School";

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [error, setError] = useState(null); // State to handle errors
  const authToken = localStorage.getItem("authToken");
  const loggedInUser = JSON.parse(authToken);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const limit = 4;

  const nextPage = () => setPage(page + 1);
  const prevPage = () => setPage(page > 1 ? page - 1 : page);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  useEffect(() => {
    document.title = "Feedback";
    
    const fetchFeedback = async () => {
      try {
        let feedbackEndpoint = "http://localhost:8080/feedback/getFeedbacks";
        
        if (loggedInUser.userType === 3) {
          feedbackEndpoint = `http://localhost:8080/feedback/getFeedbacksForAdviser/${loggedInUser.section}/${loggedInUser.schoolYear}`;
        }
        
        const response = await fetch(feedbackEndpoint);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        
        const data = await response.json();
        setFeedbackList(data);
        
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
        setError(error.message); // Set error message state
      }
    };
    
    fetchFeedback();
  }, [loggedInUser.section, loggedInUser.schoolYear]);

  const handleLogout = () => {
    // Clear the authentication token from localStorage
    localStorage.removeItem("authToken");
    // Redirect the user to the login page
    navigate("/");
  };

  const handleAcknowledge = async (feedbackId) => {
    try {
      const response = await fetch(`http://localhost:8080/feedback/acknowledge/${feedbackId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to acknowledge feedback");
      }
      // Update the feedback list to reflect the change
      setFeedbackList((prevFeedbackList) => {
        return prevFeedbackList.map((feedback) => {
          if (feedback.fid === feedbackId) {
            return { ...feedback, isAcknowledged: 1 };
          }
          return feedback;
        });
      });
    } catch (error) {
      setError(error.message); // Set error message state
    }
  };

  const createSidebarLink = (to, text, IconComponent) => (
    <Link to={to} className={navStyles["styled-link"]}>
      <IconComponent className={navStyles.icon} /> {/* Icon */}
      <span className={navStyles["link-text"]}>{text}</span> {/* Text */}
    </Link>
  );

  return (
    <div className={navStyles.wrapper} style={{ backgroundImage: "url(/public/image-2-3@2x.png)" }}>
      <div className={navStyles.sidenav}>
        <img src="/image-removebg-preview (1).png" alt="" className={navStyles["sidebar-logo"]} />
        {createSidebarLink("/report", "Report", AssessmentIcon)}
        {loggedInUser.userType !== 3 && createSidebarLink("/account", "Account", AccountBoxIcon)}
        {createSidebarLink("/student", "Student", SchoolIcon)}
        {createSidebarLink("/notification", "Notification", NotificationsActiveIcon)}
        {createSidebarLink("/feedback", "Feedback", RateReviewIcon)}
        {loggedInUser.userType !== 2 && (
          <>
            {loggedInUser.userType === 3
              ? createSidebarLink("/adviserCase", "Case", PostAddIcon)
              : createSidebarLink("/case", "Case", PostAddIcon)}
          </>
        )}
        {loggedInUser.userType !== 3 &&
          createSidebarLink("/sanctions", "Sanctions", LocalPoliceIcon)}
        {loggedInUser.userType !== 2 &&
          createSidebarLink("/Followup", "Followups", PendingActionsIcon)}
        <button className={navStyles["logoutbtn"]} onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.feedbackContent}>
          <h1 style={{ color: "white" }}>Feedback</h1>
          {error && <p className={styles.error}>Error: {error}</p>} {/* Display error message */}
          <div className={styles.feedbackList}>
            {feedbackList.slice(startIndex, endIndex).map((feedback) => (
              <div
                key={feedback.fid}
                className={styles.feedbackItem}
                style={{ background: "linear-gradient(to right, #a43737 40%, #e8bd26 95%)" }}
              >
                <div className={styles.feedbackHeader} style={{ color: "white" }}>
                  Feedback for Student: {feedback.caseEntity.student.firstname}{" "}
                  {feedback.caseEntity.student.lastname}
                </div>
                <div className={styles.feedbackDetails} style={{ color: "white" }}>
                   <p>
                    <strong>Case:</strong> {feedback.caseEntity.case_name}
                  </p>
                  <p>
                    <strong>Result:</strong> {feedback.result}
                  </p>
                </div>
                {loggedInUser.userType === 3 && !feedback.isAcknowledged && (
                  <div className={styles.feedbackActions}>
                    <button
                      onClick={() => handleAcknowledge(feedback.fid)}
                      className={styles.acknowledgeButton}
                    >
                      Acknowledge
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {page === 1 ? "" : <button onClick={prevPage}>Previous Page</button>}
              <span style={{ color: "white" }}>Page {page}</span>
              <button onClick={nextPage}>Next Page</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
