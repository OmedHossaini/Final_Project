import React, { useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../css/NewWorkoutForm.css';

const NewWorkoutForm = () => {
    const { user } = useUserContext();
    const [workoutDate, setWorkoutDate] = useState('');
    const [workoutDetails, setWorkoutDetails] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleDateChange = (e) => {
    setWorkoutDate(e.target.value);
};

    const handleDetailsChange = (e) => {
    setWorkoutDetails(e.target.value);
};

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('/api/new-workout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: user.data.email,
            date: workoutDate,
            details: workoutDetails,
        }),
        });

    if (response.ok) {
        setSuccessMessage('Workout added successfully!');
        setTimeout(() => {
        setSuccessMessage('');
        navigate('/UserHome');
        }, 3000);
    } else {
        console.error('Failed to add workout:', response.status, response.statusText);
    }
    } catch (error) {
    console.error('Error adding workout:', error.message);
    }

    setWorkoutDate('');
    setWorkoutDetails('');
};

const handleGoBack = () => {
    navigate('/UserHome');
};

return (
    <div className="new-workout-form-container">
    <h2>New Workout Form</h2>
    {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    <form onSubmit={handleSubmit}>
        <div>
        <label htmlFor="workoutDate">Date:</label>
        <input
            type="date"
            id="workoutDate"
            value={workoutDate}
            onChange={handleDateChange}
            required
        />
        </div>
        <div>
        <label htmlFor="workoutDetails">Workout Details:</label>
        <textarea
            id="workoutDetails"
            value={workoutDetails}
            onChange={handleDetailsChange}
            required
        ></textarea>
        </div>
        <button type="submit">Submit Workout</button>
    </form>
    <button onClick={handleGoBack}>Go Back to User Home</button>
    </div>
);
};

export default NewWorkoutForm;
