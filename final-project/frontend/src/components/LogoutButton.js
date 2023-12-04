import React from 'react';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { updateUser } = useUserContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    updateUser(null);

    navigate('/signin');
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default LogoutButton;
