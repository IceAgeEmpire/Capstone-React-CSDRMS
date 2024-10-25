import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import styles from "./SuspensionModal.module.css"; // Import custom styles for this modal

const SuspensionModal = ({ isOpen, onClose, suspension }) => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box className={styles["suspension-modal-modalContainer"]}>
        <div className={styles["suspension-modal-formContainer"]}>
          <h2 className={styles["suspension-modal-title"]}>Suspension Form</h2>

          {/* Date Field */}
          <p><strong>Date: </strong> {new Date().toLocaleDateString()}</p>

          {/* Principal's Address */}
          <p><strong>To:</strong> {loggedInUser.firstname} {loggedInUser.lastname}<br />
          Principal<br />
          Cebu Institute of Technology - University<br />
          Cebu City</p>

          {/* Body */}
          <p>Dear Ma'am,</p>

          <p>
            I would like to submit the recommendation for the suspension of 
            <strong> {suspension.reportEntity.record.student.name} </strong> 
            of <strong>{suspension.reportEntity.record.student.grade} - {suspension.reportEntity.record.student.section}</strong> for 
            <strong> {suspension.days}</strong> days, starting 
            <strong> {suspension.startDate}</strong> until 
            <strong> {suspension.endDate}</strong>.
          </p>

          <p>
            This disciplinary action is given to him/her for infractions/violations of school and department policies, rules, and regulations as proven after investigation. He/She will be made to report back to his/her classes on 
            <strong> {suspension.returnDate}</strong>.
          </p>

          {/* Offense */}
          <p><strong>OFFENSE(S) COMMITTED:</strong></p>
          <p> <strong>{suspension.reportEntity.complaint}</strong></p>

          {/* Closing */}
          <p>
            I am looking forward to your approval for this matter.<br />
            Thank you very much.
          </p>

          {/* Sincerely */}
          <p>
            Sincerely yours,<br />
            HS-SSO
          </p>

        </div>
      </Box>
    </Modal>
  );
};

export default SuspensionModal;
