import React, { useState } from 'react';
import { useUserContext } from '../context/UserContext';
import '../css/GoalForm.css'; 

const GoalForm = () => {
    const { user, updateUser } = useUserContext();
    const [goalType, setGoalType] = useState('workout');
    const [goal, setGoal] = useState('');

const handleGoalTypeChange = (e) => {
    setGoalType(e.target.value);
};

    const handleGoalChange = (e) => {
    setGoal(e.target.value);
    };

    const handleAddGoal = async () => {
    try {
        const response = await fetch(`/api/add-goal/${user.email}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            goalType,
            goal,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to add goal');
    }

    const responseData = await response.json();

    updateUser(responseData.user);

    setGoal('');
    } catch (error) {
    console.error('Error adding goal:', error.message);
    }
};

return (
    <div className="goal-form-container winter-theme">
    <h2>Add Your Goal</h2>
    <div>
        <label>
        Goal Type:
        <select value={goalType} onChange={handleGoalTypeChange}>
            <option value="workout">Workout</option>
            <option value="weight">Weight</option>
        </select>
        </label>
    </div>
    <div>
        <label>
        Goal:
        <input type="text" value={goal} onChange={handleGoalChange} />
        </label>
    </div>
    <button onClick={handleAddGoal}>Add Goal</button>
    </div>
);
};

export default GoalForm;
