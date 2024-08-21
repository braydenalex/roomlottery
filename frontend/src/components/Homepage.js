import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/homepage.css';

function Homepage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      setIsLoggedIn(true);
      setIsAdmin(tokenData.isAdmin); // Set the state based on the token's isAdmin property
    }
  }, []);

  const handleDashboardClick = () => {
    if (isLoggedIn) {
      if (isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };
  
  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="container">
          <img
            src="https://www.pointpark.edu/_files/images/logo-vertical--green.svg"
            alt="University Logo"
            className="logo"
          />
          <nav>
            <ul className="nav-list">
              <li><a href="/#">Home</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Room Selection Lottery System</h1>
          <p>Join the lottery to secure a room in our premium accommodations for the 2024-2025 academic year.</p>
          <button onClick={() => navigate('/login')} className="cta-button">Login</button>
          <button onClick={handleDashboardClick} className="cta-button">
            {isLoggedIn ? (isAdmin ? 'Go to Admin Dashboard' : 'Go to Dashboard') : 'Dashboard'}
          </button>
        </div>
      </section>

      {/* Button Section for Mobile */}
      <section className="button-section">
        <h2>Welcome to the Room Selection Lottery</h2>
        <div className="button-group">
          <button onClick={() => navigate('/login')} className="cta-button">Login</button>
          <button onClick={handleDashboardClick} className="cta-button">Dashboard</button>
        </div>
      </section>

      <section className="info-section" id="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="info-steps">
            <div className="step">
              <h3>Register for the Lottery</h3>
              <p>Fill out the online application and pay the $250 non-refundable deposit by March 19, 2024.</p>
            </div>
            <div className="step">
              <h3>Create Roommate Groups</h3>
              <p>Form groups for apartment, suite, or conjoined room options. All group members must sign the application.</p>
            </div>
            <div className="step">
              <h3>Select Your Room</h3>
              <p>Once your time slot opens, use the housing portal to select available rooms. Assign beds for each group member.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="timeline-section">
        <div className="container">
          <h2>Selection Timeline</h2>
          <ul className="timeline-list">
            <li><strong>January 29, 2024:</strong> Housing application opens for all returning students.</li>
            <li><strong>March 19, 2024:</strong> Housing contract and deposit due.</li>
            <li><strong>March 25, 2024:</strong> Apartment time slots are emailed to groups based on academic year and athletic/fraternity status.</li>
          </ul>
        </div>
      </section>

      <footer id="contact">
        <div className="container">
          <p>&copy; 2024 Point Park University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;