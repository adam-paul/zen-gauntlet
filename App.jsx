import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// import { supabase } from './supabaseClient';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Example of a simple protected route wrapper
function PrivateRoute({ children }) {
  const session = null; // Replace with actual Supabase session or state

  // If no session, redirect to login
  return session ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      
      {/* Catch-all: redirect to /login for now (could also be 404 page) */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

