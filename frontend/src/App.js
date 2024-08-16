import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;