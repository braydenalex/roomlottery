import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/admindashboard.css';

function AdminDashboard() {
  const [lotteries, setLotteries] = useState([]);
  const [newLottery, setNewLottery] = useState({
    lottery_name: '',
    building: '',
    floor: '',
    room_types: [{ id: Date.now(), room_type: '', max_applicants: '' }],
  });
  const [updateLottery, setUpdateLottery] = useState({
    id: '',
    lottery_name: '',
    building: '',
    floor: '',
    room_types: [{ id: Date.now(), room_type: '', max_applicants: '' }],
    status: '',
  });
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
        const userResponse = await fetch('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setCurrentUser(userData);
        } else {
          navigate('/login');
        }

        await fetchLotteries(token);  // Fetch lotteries
      } catch (error) {
        setError('Failed to fetch data');
      }
    };

    fetchUserAndLotteries();
  }, [navigate]);

    const fetchLotteries = async (token) => {
    try {
      const lotteriesResponse = await fetch('/api/admin/lotteries/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lotteriesData = await lotteriesResponse.json();
      if (lotteriesResponse.ok) {
        setLotteries(lotteriesData);
      } else {
        setError('Failed to fetch lotteries');
      }
    } catch (error) {
      setError('Failed to fetch lotteries');
    }
  };

  const handleCreateLottery = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/admin/lotteries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLottery),
      });
      if (response.ok) {
        setNewLottery({
          lottery_name: '',
          building: '',
          floor: '',
          room_types: [{ id: Date.now(), room_type: '', max_applicants: '' }],
        }); // Reset form
        await fetchLotteries(token);
      } else {
        setError('Failed to create lottery');
      }
    } catch (error) {
      setError('Failed to create lottery');
    }
  };

  const handleRoomTypeChange = (index, field, value) => {
    setNewLottery((prevState) => {
      const updatedRoomTypes = [...prevState.room_types];
      updatedRoomTypes[index] = {
        ...updatedRoomTypes[index],
        [field]: value,
      };
      return { ...prevState, room_types: updatedRoomTypes };
    });
  };

  const handleAddUpdateRoomType = () => {
    setUpdateLottery((prevState) => ({
      ...prevState,
      room_types: [...prevState.room_types, { id: Date.now(), room_type: '', max_applicants: '' }],
    }));
  };

  const handleRemoveUpdateRoomType = (index) => {
    setUpdateLottery((prevState) => ({
      ...prevState,
      room_types: prevState.room_types.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateRoomTypeChange = (index, field, value) => {
    setUpdateLottery((prevState) => {
      const updatedRoomTypes = [...prevState.room_types];
      updatedRoomTypes[index] = {
        ...updatedRoomTypes[index],
        [field]: value,
      };
      return { ...prevState, room_types: updatedRoomTypes };
    });
  };

  const handleAddRoomType = () => {
    setNewLottery((prevState) => ({
      ...prevState,
      room_types: [...prevState.room_types, { id: Date.now(), room_type: '', max_applicants: '' }],
    }));
  };

  const handleRemoveRoomType = (index) => {
    setNewLottery((prevState) => ({
      ...prevState,
      room_types: prevState.room_types.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateLottery = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/admin/lotteries/${updateLottery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateLottery),
      });
      if (response.ok) {
        const updatedLottery = await response.json();
        setUpdateLottery({
          id: '',
          lottery_name: '',
          building: '',
          floor: '',
          room_types: [{ id: Date.now(), room_type: '', max_applicants: '' }],
          status: '',
        });  // Reset form
        await fetchLotteries(token);  // Refresh lotteries list
      } else {
        setError('Failed to update lottery');
      }
    } catch (error) {
      setError('Error updating lottery');
    }
  };

  const handleUpdateLotterySelection = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedLottery = lotteries.find((lottery) => lottery.id === selectedId);

    if (selectedLottery) {
      // Set updateLottery state with the selected lottery's details
      setUpdateLottery({
        id: selectedLottery.id,
        lottery_name: selectedLottery.lottery_name || '',
        building: selectedLottery.building || '',
        floor: selectedLottery.floor || '',
        room_types: selectedLottery.room_types ? selectedLottery.room_types.map((rt) => ({
          id: rt.id || Date.now(),
          room_type: rt.room_type || '',
          max_applicants: rt.max_applicants || '',
        })) : [{ id: Date.now(), room_type: '', max_applicants: '' }],
        status: selectedLottery.status || '',
      });
    } else {
      // Reset the form if no lottery is selected
      setUpdateLottery({
        id: '',
        lottery_name: '',
        building: '',
        floor: '',
        room_types: [{ id: Date.now(), room_type: '', max_applicants: '' }],
        status: '',
      });
    }
  };

  const handleDeleteLottery = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/admin/lotteries/${id}`, {
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
      const response = await fetch(`/api/admin/lotteries/${lotteryId}/applicants`, {
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
    fetch(`/api/admin/lotteries/${selectedLottery}/applicants/${applicantId}`, {
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
      const response = await fetch(`/api/admin/lotteries/${lotteryId}/select-winners`, {
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
              {/* Create New Lottery Section */}
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
          <div>
            {newLottery.room_types.map((roomType, index) => (
              <div key={roomType.id} className="room-type-group">
                <input
                  type="text"
                  placeholder="Room Type"
                  value={roomType.room_type}
                  onChange={(e) => handleRoomTypeChange(index, 'room_type', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Max Applicants"
                  value={roomType.max_applicants}
                  onChange={(e) => handleRoomTypeChange(index, 'max_applicants', e.target.value)}
                  required
                />
                {newLottery.room_types.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRoomType(index)}
                    className="remove-roomtype-button"
                  >
                    - Room Type
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddRoomType} className="add-roomtype-button">
              + Room Type
            </button>
          </div>
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
          <button type="submit" className="create-button">Create Lottery</button>
        </form>
      </div>

        {/* Update Lottery Section */}
          <div className="dashboard-card update-card">
            <h2>Update Lottery</h2>
              <form onSubmit={handleUpdateLottery}>
                <select
                  value={updateLottery.id}
                  onChange={handleUpdateLotterySelection}
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
                  required
                />
                <input
                  type="text"
                  placeholder="Building"
                  value={updateLottery.building || ''}
                  onChange={(e) => setUpdateLottery({ ...updateLottery, building: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Floor"
                  value={updateLottery.floor || ''}
                  onChange={(e) => setUpdateLottery({ ...updateLottery, floor: e.target.value })}
                  required
                />
                <div>
                  {updateLottery.room_types?.map((roomType, index) => (
                    <div key={roomType.id || Date.now()} className="room-type-group">
                      <input
                        type="text"
                        placeholder="Room Type"
                        value={roomType.room_type || ''}
                        onChange={(e) => handleUpdateRoomTypeChange(index, 'room_type', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Max Applicants"
                        value={roomType.max_applicants || ''}
                        onChange={(e) => handleUpdateRoomTypeChange(index, 'max_applicants', e.target.value)}
                        required
                      />
                      {updateLottery.room_types.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveUpdateRoomType(index)}
                          className="remove-roomtype-button"
                        >
                          - Room Type
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddUpdateRoomType} className="add-roomtype-button">
                    + Room Type
                  </button>
                </div>
                <select
                  value={updateLottery.status || ''}
                  onChange={(e) => setUpdateLottery({ ...updateLottery, status: e.target.value })}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
                <button type="submit" className="update-button">Update Lottery</button>
              </form>
          </div>
                {/* Manage Lotteries Section */}
        <div className="dashboard-card manage-card">
          <h2>Manage Lotteries</h2>
          <ul>
            {lotteries.map((lottery) => (
              <li key={lottery.id}>
                <p><strong>{lottery.lottery_name}</strong> - ID: {lottery.id}</p>
                <p><strong>Building:</strong> {lottery.building}</p>
                <p><strong>Floor:</strong> {lottery.floor}</p>
                <p><strong>Status:</strong> {lottery.status}</p>
                {lottery.room_types && lottery.room_types.map((roomType) => (
                  <div key={roomType.id || Date.now()} className="room-type-display">
                    <p><strong>Room Type:</strong> {roomType.room_type}</p>
                    <p><strong>Max Applicants:</strong> {roomType.max_applicants}</p>
                  </div>
                ))}
                <button onClick={() => handleOpenModal(lottery.id)} className="edit-button">View Applicants</button>
                <button onClick={() => handleSelectWinners(lottery.id)} className="select-winners-button">Select Winners</button>
                <button onClick={() => handleDeleteLottery(lottery.id)} className="delete-button">Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal for Applicants */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Applicants for Lottery ID: {selectedLottery}</h2>
              <button onClick={toggleView} className="toggle-view-button">
                {isDetailedView ? 'Switch to Condensed View' : 'Switch to Detailed View'}
              </button>
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
                      </>
                    ) : (
                      <>
                        <span>{applicant.user?.email || 'N/A'}:</span>
                        <span>{applicant.user?.studentId || 'N/A'}</span>
                        <span> {applicant.room_preference || 'N/A'}</span>
                      </>
                    )}
                    <button onClick={() => handleRemoveApplicant(applicant.id)} className="remove-applicant-button">
                      Remove Applicant
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={handleCloseModal} className="close-button">Close</button>
            </div>
          </div>
        )}

        {/* Winners Modal */}
        {showWinnersModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Winners for Lottery ID: {selectedLottery}</h2>
              <button onClick={toggleView} className="toggle-view-button">
                {isDetailedView ? 'Switch to Condensed View' : 'Switch to Detailed View'}
              </button>
              <ul className="winners-list">
                {winners.map((winner, index) => (
                  <li key={winner.id}>
                    <p><strong>Winner {index + 1}:</strong> {winner.user?.email} - {winner.user?.studentId}</p>
                    <p><strong>Room Preference:</strong> {winner.room_preference}</p>
                    <p><strong>Academic Status:</strong> {winner.academic_status}</p>
                    <p><strong>Athletic Status:</strong> {winner.athletic_status}</p>
                  </li>
                ))}
              </ul>
              <button onClick={handleCloseWinnersModal} className="close-button">Close</button>
            </div>
          </div>
        )}{/* Winners Modal */}
				{showWinnersModal && (
				  <div className="modal">
					<div className="modal-content">
					  <h2>Winners for Lottery ID: {selectedLottery}</h2>
					  <button onClick={toggleView} className="toggle-view-button">
						{isDetailedView ? 'Switch to Condensed View' : 'Switch to Detailed View'}
					  </button>
					  <ul className={isDetailedView ? 'detailed-view' : 'condensed-view'}>
						{winners.map((winner, index) => (
						  <li key={winner.id} className="winner-item">
							{isDetailedView ? (
							  <>
								<p><strong>Winner {index + 1}:</strong> {winner.user?.email || 'N/A'}</p>
								<p><strong>Student ID:</strong> {winner.user?.studentId || 'N/A'}</p>
								<p><strong>Room Preference:</strong> {winner.room_preference || 'N/A'}</p>
								<p><strong>Academic Status:</strong> {winner.academic_status || 'N/A'}</p>
								<p><strong>Athletic Status:</strong> {winner.athletic_status || 'N/A'}</p>
								<p><strong>Entered On:</strong> {new Date(winner.created_at).toLocaleString()}</p>
							  </>
							) : (
							  <>
								<span>{winner.user?.email || 'N/A'}:</span>
								<span>{winner.user?.studentId || 'N/A'}</span>
								<span> {winner.room_preference || 'N/A'}</span>
							  </>
							)}
						  </li>
						))}
					  </ul>
					  <button onClick={handleCloseWinnersModal} className="close-button">Close</button>
					</div>
				  </div>
				)}

      </div>
    </div>
  );
}

export default AdminDashboard;