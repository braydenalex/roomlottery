import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/auth.css';

function Register() {
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
      <img
        src="https://www.pointpark.edu/_files/images/logo-vertical--green.svg"
        alt="University Logo"
        className="logo"
        />
        <h2>Room Lottery Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="studentId">Student ID</label>
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              maxLength="6"
              onInput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").replace(/^0/, ""))}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="auth-button">Register</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
