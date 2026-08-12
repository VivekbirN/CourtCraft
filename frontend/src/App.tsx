import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Facilities } from './pages/Facilities';
import { BookSlot } from './pages/BookSlot';
import { MyBookings } from './pages/MyBookings';
import { AdminDashboard } from './pages/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, isAdmin } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/facilities" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/book/:facilityId" element={<BookSlot />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/facilities" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
