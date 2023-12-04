import React, { useState, useEffect } from 'react';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../css/UserWorkouts.css';

const UserWorkouts = () => {
    const { user } = useUserContext();
    const [workouts, setWorkouts] = useState([]);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newDetails, setNewDetails] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleEdit = (date, details) => {
    setEditingWorkout({ date, details });
    setNewDate(date);
    setNewDetails(details);
    };

    useEffect(() => {
    const fetchWorkouts = async () => {
        try {
        if (!user || !user.data || !user.data.email) {
            return;
        }

        const response = await fetch(`/api/workouts/${user.data.email}`);
        const data = await response.json();
        if (response.ok) {
            setWorkouts(data.workouts || []);
        } else {
            console.error('Failed to fetch workouts:', response.status, response.statusText);
        }
        } catch (error) {
        console.error('Error fetching workouts:', error.message);
        }
    };

    fetchWorkouts();
    }, [user]);

    const handleUpdate = async (date, details, newDate, newDetails) => {
    try {
        const response = await fetch(`/api/edit-workout/${user.data.email}/${date}/${details}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newDate, newDetails }),
        });

        if (response.ok) {
        const updatedWorkouts = workouts.map(workout =>
            workout.date === date && workout.details === details
            ? { ...workout, date: newDate, details: newDetails }
            : workout
        );
        setWorkouts(updatedWorkouts);
        setEditingWorkout(null);
        setNewDate('');
        setNewDetails('');
        setSuccessMessage('Workout updated successfully!');
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
        } else {
        console.error('Failed to update workout:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error updating workout:', error.message);
    }
    };

    const handleDelete = async (date, details) => {
    try {
        const response = await fetch(`/api/delete-workout/${user.data.email}/${date}/${details}`, {
        method: 'DELETE',
        });

        if (response.ok) {
        const updatedWorkouts = workouts.filter(workout =>
            workout.date !== date || workout.details !== details
        );
        setWorkouts(updatedWorkouts);
        setEditingWorkout(null);
        setNewDate('');
        setNewDetails('');
        setSuccessMessage('Workout deleted successfully!');
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
        } else {
        console.error('Failed to delete workout:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error deleting workout:', error.message);
    }
    };

    const handleGoBack = () => {
    navigate('/UserHome');
    };

    return (
    <div className="container">
        <h2>Workouts</h2>
        {successMessage && <p className="success-message">{successMessage}</p>}
        <ul>
        {workouts.map(workout => (
            <li key={workout._id}>
            <p className="date">Date: {formatDate(workout.date)}</p>
            <p>Details: {workout.details}</p>
            <button onClick={() => handleEdit(workout.date, workout.details)}>Edit</button>
            <button onClick={() => handleDelete(workout.date, workout.details)}>Delete</button>
            {editingWorkout && editingWorkout.date === workout.date && editingWorkout.details === workout.details && (
                <div>
                <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                />
                <input
                    type="text"
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                />
                <button onClick={() => handleUpdate(workout.date, workout.details, newDate, newDetails)}>
                    Update
                </button>
                </div>
            )}
            </li>
        ))}
        </ul>
        <button onClick={handleGoBack}>Go Back to User Home</button>
    </div>
    );
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

export default UserWorkouts;
