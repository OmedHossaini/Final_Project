import React, { useEffect } from 'react';
import { useUserContext } from '../context/UserContext';
import '../css/UserHome.css';

const UserHome = () => {
  const { user, updateUser } = useUserContext();

  useEffect(() => {
    console.log('User:', user);
  }, [user]);

  const handleDeleteGoal = async (goalType, goal) => {
    try {
      const response = await fetch(`/api/delete-goal/${user.email}?goalType=${goalType}&goal=${goal}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      const responseData = await response.json();

      if (!responseData.user || !responseData.user.email) {
        console.error('User or user data is missing in the server response:', responseData);
        return;
      }

      updateUser(responseData.user);
    } catch (error) {
      console.error('Error deleting goal:', error.message);
    }
  };

  return (
    <div className="user-home-container winter-theme">
      <div className="user-goals-container">
        <h2>Your Goals</h2>
        {user && user.profile && user.profile.goals ? (
          <ul>
            {user.profile.goals.map((goal, index) => (
              <li key={index}>
                <p>Type: {goal.type}</p>
                <p>Goal: {goal.goal}</p>
                <button onClick={() => handleDeleteGoal(goal.type, goal.goal)}>Delete Goal</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Congratulations You Have Finished All Your Goals!</p>
        )}
      </div>
    </div>
  );
};

export default UserHome;
