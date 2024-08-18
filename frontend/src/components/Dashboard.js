import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [enteredLotteries, setEnteredLotteries] = useState([]);
  const [availableLotteries, setAvailableLotteries] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState(null);
  const [preferences, setPreferences] = useState({
    room_preference: '',
    academic_status: '',
    athletic_status: '',
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDataAndLotteries = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch user data
        const userResponse = await fetch('/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUserData(userData);
        } else {
          navigate('/login');
        }

        // Fetch lotteries the user is entered in
        const enteredResponse = await fetch('/api/user/my-lotteries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const enteredData = await enteredResponse.json();
        setEnteredLotteries(enteredData);

        // Fetch available lotteries
        const availableResponse = await fetch('/api/user/available-lotteries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const availableData = await availableResponse.json();
        setAvailableLotteries(availableData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        navigate('/login');
      }
    };

    fetchUserDataAndLotteries();
  }, [navigate]);

  const handleEnterLottery = (lotteryId) => {
    setSelectedLottery(lotteryId);
    setShowModal(true);
  };

  const submitPreferences = async () => {
    // Validate form selections
    if (!preferences.room_preference || !preferences.academic_status || !preferences.athletic_status) {
      setFormError('Please make sure to select all required preferences.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/user/enter-lottery/${selectedLottery}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setEnteredLotteries([...enteredLotteries, newEntry]);
        setAvailableLotteries(availableLotteries.filter(lottery => lottery.id !== selectedLottery));
        setShowModal(false);  // Close modal after successful entry
      } else {
        setError('Failed to enter the lottery');
      }
    } catch (error) {
      console.error('Error entering lottery:', error);
      setError('Failed to enter the lottery');
    }
  };

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

          {error && <p className="error-message">{error}</p>}

          <h2>Your Entered Lotteries</h2>
          {enteredLotteries.length > 0 ? (
            <ul className="lottery-list">
              {enteredLotteries.map((lotteryEntry) => (
                <li key={lotteryEntry.id} className="lottery-item">
                  <div className="lottery-details">
                    <p><strong>Lottery ID:</strong> {lotteryEntry.lottery_id}</p>
                    <p><strong>Room Preference:</strong> {lotteryEntry.room_preference}</p>
                    <p><strong>Academic Status:</strong> {lotteryEntry.academic_status}</p>
                    <p><strong>Athletic Status:</strong> {lotteryEntry.athletic_status}</p>
                    <p>Entered On: {new Date(lotteryEntry.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not entered in any lotteries.</p>
          )}

          <h2>Available Lotteries</h2>
          {availableLotteries.length > 0 ? (
            <ul className="lottery-list">
              {availableLotteries.map((lottery) => (
                <li key={lottery.id} className="lottery-item">
                  <div className="lottery-details">
                    <p><strong>{lottery.lottery_name}</strong></p>
                    <p><strong>Building:</strong> {lottery.building}</p>
                    <p><strong>Floor:</strong> {lottery.floor}</p>
                    <button onClick={() => handleEnterLottery(lottery.id)}>Enter Lottery</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No available lotteries at the moment.</p>
          )}

          <button onClick={handleLogout} className="logout-button">Logout</button>

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h2>Enter Lottery Preferences</h2>
                <p className="warning-message">Be truthful regarding selections, if selected room is approved, further examination of the submission will be done.</p>
                <label>
                  Room Preference:
                  <select
                    value={preferences.room_preference}
                    onChange={(e) => setPreferences({ ...preferences, room_preference: e.target.value })}
                    required
                  >
                    <option value="">Select a room preference</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Suite">Suite</option>
                  </select>
                </label>
                <label>
                  Academic Status:
                  <select
                    value={preferences.academic_status}
                    onChange={(e) => setPreferences({ ...preferences, academic_status: e.target.value })}
                    required
                  >
                    <option value="">Select academic status</option>
                    <option value="Honors">Honors (3.5&gt; GPA)</option>
                    <option value="N/A">N/A</option>
                  </select>
                </label>
                <label>
                  Athletic Status:
                  <select
                    value={preferences.athletic_status}
                    onChange={(e) => setPreferences({ ...preferences, athletic_status: e.target.value })}
                    required
                  >
                    <option value="">Select athletic status</option>
                    <option value="Athlete">Athlete</option>
                    <option value="N/A">N/A</option>
                  </select>
                </label>
                {formError && <p className="error-message">{formError}</p>}
                <button onClick={submitPreferences}>Submit</button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Dashboard;