import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/admindashboard.css';

function AdminDashboard() {
  const [lotteries, setLotteries] = useState([]);
  const [newLottery, setNewLottery] = useState({ lottery_name: '', room_type: '', building: '', floor: '', max_applicants: '' });
  const [updateLottery, setUpdateLottery] = useState({ id: '', lottery_name: '', room_type: '', status: '', building: '', floor: '', max_applicants: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState(null);
  const [isDetailedView, setIsDetailedView] = useState(true);
  const [winners, setWinners] = useState([]);
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndLotteries = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const userResponse = await fetch('http://localhost:5000/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setCurrentUser(userData);
        } else {
          navigate('/login');
        }

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

    const updatedFields = {};
    if (updateLottery.lottery_name) updatedFields.lottery_name = updateLottery.lottery_name;
    if (updateLottery.room_type) updatedFields.room_type = updateLottery.room_type;
    if (updateLottery.status) updatedFields.status = updateLottery.status;
    if (updateLottery.building) updatedFields.building = updateLottery.building;
    if (updateLottery.floor) updatedFields.floor = updateLottery.floor;
    if (updateLottery.max_applicants) updatedFields.max_applicants = updateLottery.max_applicants;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/lotteries/${updateLottery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
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

  const handleOpenModal = async (lotteryId) => {
    setSelectedLottery(lotteryId);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/lotteries/${lotteryId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setApplicants(data);
        setShowModal(true);
      } else {
        setError('Failed to fetch applicants');
      }
    } catch (error) {
      setError('Failed to fetch applicants');
    }
  };

  const handleRemoveApplicant = (applicantId) => {
    fetch(`http://localhost:5000/api/admin/lotteries/${selectedLottery}/applicants/${applicantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        if (response.ok) {
          setApplicants(applicants.filter(applicant => applicant.id !== applicantId));
        } else {
          console.error('Failed to delete applicant');
        }
      })
      .catch(error => console.error('Error deleting applicant:', error));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLottery(null);
    setApplicants([]);
  };

  const toggleView = () => {
    setIsDetailedView(!isDetailedView);
  };

  const handleSelectWinners = async (lotteryId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/lotteries/${lotteryId}/select-winners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setWinners(data.winners);
        setSelectedLottery(lotteryId);
        setShowWinnersModal(true);
      } else {
        setError('Failed to select winners');
      }
    } catch (error) {
      setError('Error selecting winners');
    }
  };

  const handleCloseWinnersModal = () => {
    setShowWinnersModal(false);
    setSelectedLottery(null);
    setWinners([]);
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
            <input
              type="text"
              placeholder="Building"
              value={newLottery.building}
              onChange={(e) => setNewLottery({ ...newLottery, building: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Floor"
              value={newLottery.floor}
              onChange={(e) => setNewLottery({ ...newLottery, floor: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Max Applicants"
              value={newLottery.max_applicants}
              onChange={(e) => setNewLottery({ ...newLottery, max_applicants: e.target.value })}
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
            const selectedLottery = lotteries.find((lottery) => lottery.id === parseInt(e.target.value));
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
          value={updateLottery.lottery_name || ''}
          onChange={(e) => setUpdateLottery({ ...updateLottery, lottery_name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Room Type"
          value={updateLottery.room_type || ''}
          onChange={(e) => setUpdateLottery({ ...updateLottery, room_type: e.target.value })}
        />

        <input
          type="text"
          placeholder="Building"
          value={updateLottery.building || ''}
          onChange={(e) => setUpdateLottery({ ...updateLottery, building: e.target.value })}
        />

        <input
          type="text"
          placeholder="Floor"
          value={updateLottery.floor || ''}
          onChange={(e) => setUpdateLottery({ ...updateLottery, floor: e.target.value })}
        />

        <input
          type="number"
          placeholder="Max Applicants"
          value={updateLottery.max_applicants || ''}
          onChange={(e) => setUpdateLottery({ ...updateLottery, max_applicants: e.target.value })}
        />

        <select
          value={updateLottery.status || ''}
          onChange={(e) => setUpdateLottery({ ...updateLottery, status: e.target.value })}
          required
        >
          <option value="">Select Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="Pending">Pending</option>
        </select>

        <button type="submit" className="update-button">Update Lottery</button>
      </form>
    </div>

    <div className="dashboard-card manage-card">
      <h2>Manage Lotteries</h2>
      <ul>
        {lotteries.map((lottery) => (
          <li key={lottery.id}>
            <p><strong>{lottery.lottery_name}</strong> - ID: {lottery.id}</p>
            <p><strong>Building:</strong> {lottery.building}</p>
            <p><strong>Floor:</strong> {lottery.floor}</p>
            <p><strong>Room Type:</strong> {lottery.room_type}</p>
            <p><strong>Max Applicants:</strong> {lottery.max_applicants}</p>
            <p><strong>Status:</strong> {lottery.status}</p>
            <button onClick={() => handleOpenModal(lottery.id)} className="edit-button">View Applicants</button>
            <button onClick={() => handleDeleteLottery(lottery.id)} className="delete-button">Delete</button>
          </li>
        ))}
      </ul>
    </div>

    <div className="dashboard-card select-winners-card">
      <h2>Select Winners for Lotteries</h2>
      <ul>
        {lotteries.map((lottery) => (
          <li key={lottery.id}>
            <p><strong>{lottery.lottery_name}</strong> - ID: {lottery.id}</p>
            <p><strong>Building:</strong> {lottery.building}</p>
            <p><strong>Floor:</strong> {lottery.floor}</p>
            <p><strong>Room Type:</strong> {lottery.room_type}</p>
            <button onClick={() => handleSelectWinners(lottery.id)} className="select-winners-button">
              Select Winners
            </button>
          </li>
        ))}
      </ul>
    </div>

      {showWinnersModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Winners for Lottery ID: {selectedLottery}</h2>
            
            {/* Toggle View Button */}
            <button onClick={toggleView} className="toggle-view-button">
              {isDetailedView ? 'Switch to Condensed View' : 'Switch to Detailed View'}
            </button>
            
            {/* Winners List */}
            <ul className="winners-list">
              {winners.map((winner, index) => (
                <li key={winner.id} className="winner-item">
                  {/* Render based on isDetailedView */}
                  {isDetailedView ? (
                    <>
                      <p><strong>Winner {index + 1}:</strong> {winner.user.email} - {winner.user.studentId}</p>
                      <p><strong>Room Preference:</strong> {winner.room_preference}</p>
                      <p><strong>Academic Status:</strong> {winner.academic_status}</p>
                      <p><strong>Athletic Status:</strong> {winner.athletic_status}</p>
                    </>
                  ) : (
                    <>
                      <span><strong>Winner {index + 1}:</strong> {winner.user.email} - {winner.user.studentId}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
            
            {/* Close Button */}
            <button onClick={handleCloseWinnersModal} className="close-button">Close</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Applicants for Lottery ID: {selectedLottery}</h2>
            
            {/* Toggle View Button */}
            <button onClick={toggleView} className="toggle-view-button">
              {isDetailedView ? 'Switch to Condensed View' : 'Switch to Detailed View'}
            </button>
            
            {/* Applicants List */}
            <ul className={isDetailedView ? 'detailed-view' : 'condensed-view'}>
              {applicants.map(applicant => (
                <li key={applicant.id} className="applicant-item">
                  {isDetailedView ? (
                    <>
                      <p><strong>Email:</strong> {applicant.user?.email || 'N/A'}</p>
                      <p><strong>Student ID:</strong> {applicant.user?.studentId || 'N/A'}</p>
                      <p><strong>Academic Status:</strong> {applicant.academic_status || 'N/A'}</p>
                      <p><strong>Athletic Status:</strong> {applicant.athletic_status || 'N/A'}</p>
                      <p><strong>Room Preference:</strong> {applicant.room_preference || 'N/A'}</p>
                      <p><strong>Entered On:</strong> {new Date(applicant.created_at).toLocaleString()}</p>
                      <button 
                        onClick={() => handleRemoveApplicant(applicant.id)} 
                        className="delete-applicant-button"
                      >
                        Remove Applicant
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{applicant.user?.email || 'N/A'}:</span>
                      <span>{applicant.user?.studentId || 'N/A'} </span>
                      <button 
                        onClick={() => handleRemoveApplicant(applicant.id)} 
                        className="delete-applicant-button"
                      >
                        Remove Applicant
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            
            {/* Close Button */}
            <button onClick={handleCloseModal} className="close-button">Close</button>
          </div>
        </div>
      )}
    )}
  </div>
</div>
);
}

export default AdminDashboard;