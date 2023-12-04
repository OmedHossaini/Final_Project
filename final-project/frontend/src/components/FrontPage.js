import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/FrontPage.css';
const Home = () => {
  const [inspiration, setInspiration] = useState('');

  useEffect(() => {
    fetch('http://localhost:9365/api/inspiration')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setInspiration(data.inspiration))
      .catch(error => console.error('Error fetching inspiration:', error));
  }, []);

  return (
    <div className="home-container">
      <h2 className="home-title">Home</h2>
      <p className="welcome-text">Welcome to the Fitness App!</p>
      <p className="inspiration-text">{inspiration}</p>
      <div className="buttons-container">
        <Link to="/signin" className="auth-button">
          Sign In
        </Link>
        <Link to="/signup" className="auth-button">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Home;

