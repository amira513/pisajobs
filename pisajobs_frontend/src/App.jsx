import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardUser from './pages/DashboardUser';
import DashboardEmployer from './pages/DashboardEmployer';
import TrovaLavoro from './pages/TrovaLavoro';


// ProtectedRoute checks if user is logged in and has the correct role
function ProtectedRoute({ user, children, role }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role !== undefined && user.is_employer !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  // Initialize user from localStorage to persist login
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });



  // Keep localStorage in sync when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', user.access); // assuming JWT token in user.access
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          <Navbar user={user} setUser={setUser} />

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register />} />
              
              {/* Dashboard for students/workers */}
              <Route
                path="/dashboard/user"
                element={
                  <ProtectedRoute user={user} role={false}>
                    <DashboardUser user={user}/>
                  </ProtectedRoute>
                }
              />

              {/* Dashboard for employers */}
              <Route
                path="/dashboard/employer"
                element={
                  <ProtectedRoute user={user} role={true}>
                    <DashboardEmployer user={user}/>
                  </ProtectedRoute>
                }
              />

              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/trovalavoro" element={<TrovaLavoro />} />
            </Routes>
          </Box>

          <Footer />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
