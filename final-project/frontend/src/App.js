import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UserHome from './components/UserHome';
import ProfileForm from './components/ProfileForm';
import FrontPage from './components/FrontPage'; 
import SignInForm from './components/SignInForm'; 
import SignUpForm from './components/SignUpForm'; 
import NewWorkoutForm from './components/NewWorkoutForm';
import { UserProvider } from './context/UserContext';
import UserWorkouts from './components/UserWorkouts';
import WeightTracker from './components/WeightTracker'; 
import Snowfall from './components/Snowfall';
import GoalForm from './components/GoalForm'; 

function App() {
  return (
    <UserProvider>
      <Router>
        <Snowfall />
        <Routes>
          <Route path="/" element={<Layout><FrontPage /></Layout>} />
          <Route path="/signin" element={<Layout><SignInForm /></Layout>} />
          <Route path="/signup" element={<Layout><SignUpForm /></Layout>} />
          <Route path="/UserHome" element={<Layout><UserHome /></Layout>} />
          <Route path="/UserHome/profile" element={<Layout><ProfileForm /></Layout>} />
          <Route path="/UserHome/new-workout" element={<Layout><NewWorkoutForm /></Layout>} />
          <Route path="/UserHome/workouts" element={<Layout><UserWorkouts /></Layout>} />
          <Route path="/UserHome/WeightTracker" element={<Layout><WeightTracker /></Layout>} />
          <Route path="/UserHome/goals" element={<Layout><GoalForm /></Layout>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
