import React, { useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../css/ProfileForm.css';

const ProfileForm = () => {
  const { user, updateUser } = useUserContext();
  const navigate = useNavigate();
  const [height, setHeight] = useState(user?.profile?.height || '');
  const [sex, setSex] = useState(user?.profile?.sex || '');
  const [weight, setWeight] = useState(user?.profile?.weight || '');
  const [notification, setNotification] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('/api/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: user.email, height, sex, weight }),
    });

    const data = await response.json();

    if (response.ok) {
      updateUser({ ...user, profile: { height, sex, weight } });
      setNotification('Profile changes saved successfully!');
      setTimeout(() => {
        navigate('/UserHome');
      }, 2000);
    } else {
      console.error('Error updating profile:', data.message);
    }
  };

  return (
    <div className="profile-form-container">
      <form className="profile-form" onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>
        <label htmlFor="height">Height (cm):</label>
        <input
          type="number"
          id="height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          required
        />
        <label htmlFor="sex">Sex:</label>
        <select
          id="sex"
          value={sex}
          onChange={(e) => setSex(e.target.value)}
          required
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="preferNotToSay">Prefer not to say</option>
        </select>
        <label htmlFor="weight">Weight (kg):</label>
        <input
          type="number"
          id="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        />
        <button type="submit">Save Changes</button>
        {notification && <p>{notification}</p>}
      </form>
      <button onClick={() => navigate('/UserHome')}>Go Back to UserHome</button>
    </div>
  );
};

export default ProfileForm;
