import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Navigation.module.css";

import AssessmentIcon from "@mui/icons-material/Assessment";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PostAddIcon from "@mui/icons-material/PostAdd";
import RateReviewIcon from "@mui/icons-material/RateReview";
import SchoolIcon from "@mui/icons-material/School";

const Followup = () => {
  const authToken = localStorage.getItem("authToken");
  const loggedInUser = JSON.parse(authToken);
  const navigate = useNavigate();
  const [followups, setFollowups] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 4;

  useEffect(() => {
    document.title = "Followup";
    const fetchFollowups = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/followup/getAllFollowUpsByAdviser/${loggedInUser.section}/${loggedInUser.schoolYear}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setFollowups(data);
      } catch (error) {
        console.error("Failed to fetch follow-ups:", error);
      }
    };

    fetchFollowups();
  }, [loggedInUser.adviserId, page]);

  const createSidebarLink = (to, text, IconComponent) => (
    <Link to={to} className={styles["styled-link"]}>
      <IconComponent className={styles.icon} />
      <span className={styles["link-text"]}>{text}</span>
    </Link>
  );

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const nextPage = () => setPage(page + 1);
  const prevPage = () => setPage(page > 1 ? page - 1 : page);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return (
    <div className={styles.wrapper} style={{ backgroundImage: "url(/public/image-2-3@2x.png)" }}>
      <div className={styles.sidenav}>
        <img src="/image-removebg-preview (1).png" alt="" className={styles["sidebar-logo"]} />
        {createSidebarLink("/report", "Report", AssessmentIcon)}
        {createSidebarLink("/student", "Student", SchoolIcon)}
        {createSidebarLink("/notification", "Notification", NotificationsActiveIcon)}
        {loggedInUser.userType !== 1 && createSidebarLink("/feedback", "Feedback", RateReviewIcon)}
        {loggedInUser.userType !== 2 && (
          <>
            {loggedInUser.userType === 3
              ? createSidebarLink("/adviserCase", "Case", PostAddIcon)
              : createSidebarLink("/case", "Case", PostAddIcon)}
          </>
        )}
        {loggedInUser.userType !== 3 &&
          createSidebarLink("/sanctions", "Sanctions", LocalPoliceIcon)}
        {createSidebarLink("/Followup", "Followups", PendingActionsIcon)}
        <button className={styles["logoutbtn"]} onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            background: "linear-gradient(to top, rgba(100,0,0,.9), rgba(100,0,0,0.3))",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              width: "85vh",
              border: "2px solid black",
              borderRadius: "12px",
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              backgroundColor: "#a02727",
            }}
          >
            <h2 style={{ color: "white" }}>All Followups</h2>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              padding: "32px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {followups.slice(startIndex, endIndex).map((followup) => (
              <div
                style={{
                  border: "1px black solid",
                  width: "80vh",
                  borderRadius: "15px",
                  background: "linear-gradient(to right, #a43737 40%, #e8bd26 95%)",
                }}
              >
                <li style={{ listStyle: "none" }} key={followup.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      color: "white",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ alignSelf: "flex-start", justifySelf: "self-start" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            fontSize: "20px",
                          }}
                        >
                          Hello Adviser <b> {loggedInUser.firstname}</b>
                        </div>
                        <div style={{ fontSize: "20px" }}>
                          You're Student{" "}
                          <b>
                            {followup.caseEntity.student.firstname}{" "}
                            {followup.caseEntity.student.lastname}{" "}
                          </b>
                          needs to go at the <b>SSO</b>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: "18px" }}>
                      <p>
                        Date: <b>{followup.date}</b>
                      </p>
                      <p>
                        Time: <b>{followup.time}</b>
                      </p>
                      <p>
                        Case: <b>{followup.caseEntity.case_name}</b>
                      </p>
                    </div>
                  </div>
                </li>
              </div>
            ))}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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

export default Followup;
