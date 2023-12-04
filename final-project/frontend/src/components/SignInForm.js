import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import '../css/SignInForm.css';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { updateUser } = useUserContext();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

const signIn = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Sign-in failed');
    }

    const data = await response.json();
    console.log('User data after sign-in:', data);
    setError('');
    updateUser({ ...data, email });
    navigate('/UserHome');
  } catch (error) {
    console.error('Error signing in:', error.message);
    setError('Invalid email or password. Please try again.');
  }
};


return (
  <div className="signin-form-container">
    <form onSubmit={signIn}>
      <h2>Sign In</h2>
      <label htmlFor="email">Email:</label>
      <input type="email" id="email" value={email} onChange={handleEmailChange} />
      <label htmlFor="password">Password:</label>
      <input type="password" id="password" value={password} onChange={handlePasswordChange} />
      <button>Sign In</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </form>
  </div>
);
};

export default SignInForm;
