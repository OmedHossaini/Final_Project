import React, { useState, useEffect } from 'react';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../css/WeightTracker.css';

const WeightTracker = () => {
  const { user } = useUserContext();
  const [userData, setUserData] = useState({ weights: [], profile: { height: 0, sex: '' } });
  const [newWeight, setNewWeight] = useState('');
  const [bmiData, setBmiData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/user/${user.data.email}`);
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user || { weights: [], profile: { height: 0, sex: '' } });
      } else {
        console.error('Failed to fetch user data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  useEffect(() => {
    if (!user || !user.data) {
      return;
    }

    fetchUser();
  }, [user]);

  const calculateBMI = (weight) => {
    const heightInMeters = userData.profile.height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    let interpretation = '';
    if (user.profile && user.profile.sex === 'male') {
      interpretation = getBMIMessageForMen(bmi);
    } else if (user.profile && user.profile.sex === 'female') {
      interpretation = getBMIMessageForWomen(bmi);
    }

    return { bmi: bmi.toFixed(2), interpretation };
  };

  const getBMIMessageForMen = (bmi) => {
    if (bmi < 18.5) {
      return 'Underweight for men';
    } else if (bmi >= 18.5 && bmi < 25) {
      return 'Normal weight for men';
    } else if (bmi >= 25 && bmi < 30) {
      return 'Overweight for men';
    } else {
      return 'Obese for men';
    }
  };

  const getBMIMessageForWomen = (bmi) => {
    if (bmi < 18.5) {
      return 'Underweight for women';
    } else if (bmi >= 18.5 && bmi < 25) {
      return 'Normal weight for women';
    } else if (bmi >= 25 && bmi < 30) {
      return 'Overweight for women';
    } else {
      return 'Obese for women';
    }
  };

  const userSex = user && user.profile ? user.profile.sex : '';

  const handleAddWeight = async () => {
    const numericWeight = parseFloat(newWeight);

    if (isNaN(numericWeight) || numericWeight <= 0) {
      console.error('Please enter a valid numeric weight.');
      return;
    }

    try {
      const response = await fetch(`/api/add-weight/${user.data.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weight: newWeight, height: userData.profile.height }),
      });

      if (response.ok) {
        const updatedWeights = [...userData.weights, { date: new Date().toISOString(), weight: newWeight }];
        setUserData({ ...userData, weights: updatedWeights });
        setNewWeight('');
        setSuccessMessage('Weight entry added successfully!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        console.error('Failed to add weight:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error adding weight:', error.message);
    }
  };

  const handleRemoveWeight = async (date) => {
    try {
      const response = await fetch(`/api/remove-weight/${user.data.email}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date }),
      });

      if (response.ok) {
        const updatedWeights = userData.weights.filter((entry) => entry.date !== date);
        setUserData({ ...userData, weights: updatedWeights });
        setSuccessMessage('Weight entry deleted successfully!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        console.error('Failed to remove weight:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error removing weight:', error.message);
    }
  };

  const displayBMI = () => {
    const bmiEntries = userData.weights.map((entry) => {
      const bmi = calculateBMI(entry.weight);
      return { date: entry.date, bmi };
    });
    setBmiData(bmiEntries);
  };

  const handleGoBack = () => {
    navigate('/UserHome');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="weight-tracker-container">
      <h2 className="weight-tracker-header">Weight Tracker</h2>
      <div>
        <label htmlFor="newWeight">Enter Your Daily Weight (kg):</label>
        <input
          type="number"
          id="newWeight"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
        />
        <button onClick={handleAddWeight}>Add Weight</button>
      </div>
      <div>
        <h3>Weight Entries</h3>
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        <ul>
          {userData.weights.map((entry) => (
            <li key={entry.date}>
              <p>Date: {formatDate(entry.date)}</p>
              <p>Weight: {entry.weight} kg</p>
              <p>Gender: {userSex}</p>
              <p>Height: {userData.profile.height} cm</p>
              <p>BMI: {calculateBMI(entry.weight).bmi}</p>
              <p>BMI Interpretation: {calculateBMI(entry.weight).interpretation}</p>
              <button onClick={() => handleRemoveWeight(entry.date)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button onClick={displayBMI}>Calculate BMI</button>
        <h3>BMI Data</h3>
        <ul>
          {bmiData.map((entry) => (
            <li key={entry.date}>
              <p>Date: {formatDate(entry.date)}</p>
              <p>BMI: {entry.bmi.bmi}</p>
              <p>BMI Interpretation: {entry.bmi.interpretation}</p>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleGoBack}>Go Back to User Home</button>
    </div>
  );
};

export default WeightTracker;
