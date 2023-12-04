import React from 'react';
import { Link } from 'react-router-dom';
import '../css/NavBar.css';
import LogoutButton from './LogoutButton'; 

const NavBar = () => {
  return (
    <nav className="tracker-nav">
      <div className="logo-container">
        <span className="logo" role="img" aria-label="workout emoji">
          💪
        </span>
        <p className="logo-text">FitSync</p>
      </div>
      <ul>
        <li>
          <Link to="/UserHome" className="nav-link" data-cool="🏡 Home">
            User Home
          </Link>
        </li>
        <li>
          <Link to="/UserHome/profile" className="nav-link" data-cool="🌟 Awesome Profile">
            Your Workout Profile
          </Link>
        </li>
        <li>
          <Link to="/UserHome/new-workout" className="nav-link" data-cool="💪 Super Workout">
            Add a New Workout
          </Link>
        </li>
        <li>
          <Link to="/UserHome/workouts" className="nav-link" data-cool="🚀 Epic History">
            Your Workout History
          </Link>
        </li>
        <li>
          <Link to="/UserHome/WeightTracker" className="nav-link" data-cool="🏋️‍♂️ Weight Wizardry">
            Weight Tracker
          </Link>
        </li>
        <li>
          <Link to="/UserHome/goals" className="nav-link" data-cool="🎯 Set Goals">
            Set Goals
          </Link>
        </li>
        <li>
          <LogoutButton />
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;

