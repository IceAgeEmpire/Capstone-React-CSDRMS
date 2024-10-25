import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from "./Login.module.css";
import { AuthContext } from './AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  useEffect(() => {
    document.title = "Login";
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      try {
        const authTokenObj = JSON.parse(authToken);
        if (!authTokenObj) {
          navigate('/');
        } else {
          const { userType, userObject } = authTokenObj;
          switch (userType) {
            case 1:
            case 2:
            case 3:
              navigate('/record', { state: { userObject } });
              break;
            case 4:
              navigate('/AdminDashboard', { state: { userObject } });
              break;
            case 5:
              navigate('/report', { state: { userObject } }); // Redirect for userType 5
              break;
            case 6:
              navigate('/record', { state: { userObject } }); // Redirect for userType 5
              break;  
            default:
              navigate('/');
          }
        }
      } catch (error) {
        console.error('Error parsing authToken:', error);
        navigate('/');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/user/login', {
        username,
        password,
      });
  
      if (!response.data.userType) {
        alert('Incorrect Username or Password');
        return;
      }
  
      const authTokenString = JSON.stringify(response.data);
      localStorage.setItem('authToken', authTokenString);
  
      const { userType, userObject } = response.data;
      login(response.data); // Update context
  
      console.log("User id: ", response.data.uid);
  
      // Only log time if the userType is 3
      if (userType === 3) {
        const loginTime = new Date().toISOString(); // Get current time in ISO format
        await axios.post('http://localhost:8080/time-log/login', {
          userId: response.data.uid, // Assuming `userObject` contains `uid`
          loginTime: loginTime,
        });
      }
  
      // Redirect based on userType
      switch (userType) {
        case 1:
        case 2:
        case 3:
          navigate('/record', { state: { userObject } });
          break;
        case 4:
          navigate('/AdminDashboard', { state: { userObject } });
          break;
        case 5:
          navigate('/report', { state: { userObject } }); // Redirect for userType 5
          break;
        case 6:
          navigate('/record', { state: { userObject } }); // Redirect for userType 6
          break;  
        default:
          alert('Incorrect Username or Password');
      }
    } catch (error) {
      console.error('Login Failed', error.response.data);
      alert('Incorrect Username or Password');
    }
  };
  

  return (
    <div className={styles.loginbg}>
      <div className={styles.titleImage}></div>
      <div className={styles.ssoImage}></div>
      <div className={styles.container}>
        <div className={styles.form_area}>
          <p className={styles.title}>User Authentication</p>
          <form onSubmit={handleLogin}>
            <div className={styles.form_group}>
              <label className={styles.sub_title} htmlFor="username">Username</label>
              <input
                className={styles.form_style}
                type="user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className={styles.form_group}>
              <label className={styles.sub_title} htmlFor="password">Password</label>
              <input
                className={styles.form_style}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.btn}>LOGIN</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
