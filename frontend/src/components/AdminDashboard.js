import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/admindashboard.css';

function AdminDashboard() {
  const [lotteries, setLotteries] = useState([]);
  const [newLottery, setNewLottery] = useState({ lottery_name: '', room_type: '' });
  const [updateLottery, setUpdateLottery] = useState({ id: '', lottery_name: '', room_type: '', status: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndLotteries = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Fetch the current user
        const userResponse = await fetch('http://localhost:5000/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setCurrentUser(userData);
        } else {
          navigate('/login');
        }

        // Fetch lotteries
        const lotteriesResponse = await fetch('http://localhost:5000/api/admin/lotteries/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const lotteriesData = await lotteriesResponse.json();
        if (lotteriesResponse.ok) {
          setLotteries(lotteriesData);
        } else {
          setError('Failed to fetch lotteries');
        }
      } catch (error) {
        setError('Failed to fetch data');
      }
    };

    fetchUserAndLotteries();
  }, [navigate]);

  const handleCreateLottery = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/admin/lotteries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLottery),
      });
      if (response.ok) {
        const createdLottery = await response.json();
        setLotteries([...lotteries, createdLottery]);
      } else {
        setError('Failed to create lottery');
      }
    } catch (error) {
      setError('Failed to create lottery');
    }
  };

  const handleUpdateLottery = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // Only include fields that have values (fields left empty won't be updated)
    const updatedFields = {};
    if (updateLottery.lottery_name) updatedFields.lottery_name = updateLottery.lottery_name;
    if (updateLottery.room_type) updatedFields.room_type = updateLottery.room_type;
    if (updateLottery.status) updatedFields.status = updateLottery.status;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/lotteries/${updateLottery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields), // Send only the fields that need updating
      });
      if (response.ok) {
        const updated = await response.json();
        setLotteries(lotteries.map((lottery) => (lottery.id === updated.id ? updated : lottery)));
      } else {
        setError('Failed to update lottery');
      }
    } catch (error) {
      setError('Failed to update lottery');
    }
  };

  const handleDeleteLottery = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/lotteries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setLotteries(lotteries.filter((lottery) => lottery.id !== id));
      } else {
        setError('Failed to delete lottery');
      }
    } catch (error) {
      setError('Failed to delete lottery');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="admin-dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      {currentUser && (
        <div className="current-user">
          <p>Logged in as: <strong>{currentUser.email}</strong></p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <div className="dashboard-content">
        <div className="dashboard-card create-card">
          <h2>Create New Lottery</h2>
          <form onSubmit={handleCreateLottery}>
            <input
              type="text"
              placeholder="Lottery Name"
              value={newLottery.lottery_name}
              onChange={(e) => setNewLottery({ ...newLottery, lottery_name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Room Type"
              value={newLottery.room_type}
              onChange={(e) => setNewLottery({ ...newLottery, room_type: e.target.value })}
              required
            />
            <button type="submit" className="create-button">Create Lottery</button>
          </form>
        </div>

        <div className="dashboard-card update-card">
          <h2>Update Lottery</h2>
          <form onSubmit={handleUpdateLottery}>
            <select
              value={updateLottery.id}
              onChange={(e) => {
                const selectedLottery = lotteries.find((lottery) => lottery.id === e.target.value);
                setUpdateLottery({ ...selectedLottery, id: e.target.value });
              }}
              required
            >
              <option value="">Select Lottery</option>
              {lotteries.map((lottery) => (
                <option key={lottery.id} value={lottery.id}>
                  {lottery.lottery_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Lottery Name"
              value={updateLottery.lottery_name}
              onChange={(e) => setUpdateLottery({ ...updateLottery, lottery_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Room Type"
              value={updateLottery.room_type}
              onChange={(e) => setUpdateLottery({ ...updateLottery, room_type: e.target.value })}
            />
            <input
              type="text"
              placeholder="Status"
              value={updateLottery.status}
              onChange={(e) => setUpdateLottery({ ...updateLottery, status: e.target.value })}
            />
            <button type="submit" className="update-button">Update Lottery</button>
          </form>
        </div>

        <div className="dashboard-card manage-card">
          <h2>Manage Lotteries</h2>
          <ul>
            {lotteries.map((lottery) => (
              <li key={lottery.id}>
                <p><strong>{lottery.lottery_name}</strong> - Room Type: {lottery.room_type}</p>
                <p>Status: {lottery.status}</p>
                <button onClick={() => handleDeleteLottery(lottery.id)} className="delete-button">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;