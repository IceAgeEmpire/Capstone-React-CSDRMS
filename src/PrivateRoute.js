import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component }) => {
  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;

  return isAuthenticated ? Component : <Navigate to="/" />;
};

export default PrivateRoute;