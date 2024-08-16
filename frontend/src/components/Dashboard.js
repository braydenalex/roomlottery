import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUserData(data);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {userData ? (
        <>
          <h1>Welcome to Your Dashboard</h1>
          <div className="user-info">
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Student ID:</strong> {userData.studentId}</p>
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Dashboard;
