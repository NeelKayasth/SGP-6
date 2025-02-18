import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Notification } from './components/Notification';
import { AuthGuard } from './components/AuthGuard';
import HomePage from './pages/HomePage';
import FindRidePage from './pages/FindRidePage';
import OfferRidePage from './pages/OfferRidePage';
import MyRidesPage from './pages/MyRidesPage';
import ProfilePage from './pages/ProfilePage';
import { SignInPage, SignUpPage } from './pages/AuthPages';
import EmailVerificationPage from './pages/EmailVerificationPage';
import EmailVerifiedPage from './pages/EmailVerifiedPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Notification />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        
        {/* Protected Routes */}
        <Route path="/find-ride" element={<AuthGuard><FindRidePage /></AuthGuard>} />
        <Route path="/offer-ride" element={<AuthGuard><OfferRidePage /></AuthGuard>} />
        <Route path="/my-rides" element={<AuthGuard><MyRidesPage /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
      </Routes>
    </div>
  );
}

export default App;