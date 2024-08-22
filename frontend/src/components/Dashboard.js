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
  const [roomTypes, setRoomTypes] = useState([]);
  const [preferences, setPreferences] = useState({
    room_preference: '',
    academic_status: '',
    athletic_status: '',
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndLotteries = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Fetch user data
        const userResponse = await fetch('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUserData(userData);
        } else {
          navigate('/login');
        }

        // Fetch entered lotteries
        const enteredResponse = await fetch('/api/user/my-lotteries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const enteredData = await enteredResponse.json();
        setEnteredLotteries(enteredData || []);

        // Fetch available lotteries
        const availableResponse = await fetch('/api/user/available-lotteries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const availableData = await availableResponse.json();
        setAvailableLotteries(availableData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        navigate('/login');
      }
    };

    fetchUserAndLotteries();
  }, [navigate]);

  const handleEnterLottery = async (lotteryId) => {
    setSelectedLottery(lotteryId);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/user/lotteries/${lotteryId}/room-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roomTypesData = await response.json();
      setRoomTypes(roomTypesData || []);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching room types:', error);
      setError('Failed to fetch room types');
    }
  };

const submitPreferences = async () => {
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
      setEnteredLotteries([...enteredLotteries, newEntry]);  // Update entered lotteries

      // Update available lotteries by refetching or removing the entered one
      setAvailableLotteries(availableLotteries.filter(lottery => lottery.id !== selectedLottery));

      // Clear form and modal
      setPreferences({
        room_preference: '',
        academic_status: '',
        athletic_status: '',
      });
      setShowModal(false);

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
                    {lotteryEntry.room_lottery ? (
                      <>
                        <p><strong>Lottery Name:</strong> {lotteryEntry.room_lottery.lottery_name || 'N/A'} - ID: {lotteryEntry.lottery_id}</p>
                        <p><strong>Building:</strong> {lotteryEntry.room_lottery.building || 'N/A'}</p>
                        <p><strong>Floor:</strong> {lotteryEntry.room_lottery.floor || 'N/A'}</p>
                        <p><strong>Room Types: </strong> 
                          {Array.isArray(lotteryEntry.room_lottery.room_types) && lotteryEntry.room_lottery.room_types.length > 0
                            ? lotteryEntry.room_lottery.room_types.map((roomType) => (
                                <span key={roomType.id}>
                                  &nbsp;{roomType.room_type} ({roomType.max_applicants} spots)
                                </span>
                              ))
                            : 'No room types available'}
                        </p>
                        <p><strong>Room Preference:</strong> {lotteryEntry.room_preference}</p>
                        <p><strong>Academic Status:</strong> {lotteryEntry.academic_status}</p>
                        <p><strong>Athletic Status:</strong> {lotteryEntry.athletic_status}</p>
                        <p><strong>Entered On:</strong> {new Date(lotteryEntry.created_at).toLocaleString()}</p>
                      </>
                    ) : (
                      <p>No lottery details available.</p>
                    )}
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
              {availableLotteries.map((lottery) => {
                // Ensure room_types is defined and calculate total and remaining spots
                const totalSpots = Array.isArray(lottery.room_types) ? lottery.room_types.reduce((acc, roomType) => acc + roomType.max_applicants, 0) : 0;
                const remainingSpots = totalSpots - (lottery.current_entries || 0);

                return (
                  <li key={lottery.id} className="lottery-item">
                    <div className="lottery-details">
                      <p><strong>Lottery Name:</strong> {lottery.lottery_name} - ID: {lottery.id}</p>
                      <p><strong>Building:</strong> {lottery.building}</p>
                      <p><strong>Floor:</strong> {lottery.floor}</p>
                      <p><strong>Room Types:</strong>
                        {Array.isArray(lottery.room_types) && lottery.room_types.length > 0
                          ? lottery.room_types.map(roomType => (
                              <span key={roomType.id} className="room-type-display">
                                &nbsp;{roomType.room_type} ({roomType.max_applicants} spots)
                              </span>
                            ))
                          : 'No room types available'}
                      </p>
                      <p><strong>Remaining Spots:</strong> {remainingSpots > 0 ? remainingSpots : 'No spots left'}</p>
                      <button onClick={() => handleEnterLottery(lottery.id)} disabled={remainingSpots <= 0}>
                        Enter Lottery
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No available lotteries at the moment.</p>
          )}
          <button onClick={handleLogout} className="logout-button">Logout</button>

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h2>Enter Lottery Preferences</h2>
                <p className="warning-message">Be truthful regarding selections; further verification will be conducted after room approval.</p>
                <label>
                  Room Preference:
                  <select
                    value={preferences.room_preference}
                    onChange={(e) => setPreferences({ ...preferences, room_preference: e.target.value })}
                    required
                  >
                    <option value="">Select a room preference</option>
                    {roomTypes.map((roomType) => (
                      <option key={roomType.id} value={roomType.room_type}>
                        {roomType.room_type}
                      </option>
                    ))}
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
                    <option value="Honors">Honors (GPA > 3.5)</option>
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