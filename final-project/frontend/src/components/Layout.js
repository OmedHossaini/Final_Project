import React from 'react';
import NavBar from './NavBar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isNavBarVisible =
    !['/', '/signin', '/signup'].includes(location.pathname);

  return (
    <div>
      {isNavBarVisible && <NavBar />}
      {children}
    </div>
  );
};

export default Layout;
