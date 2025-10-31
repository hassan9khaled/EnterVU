import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import { useAuth } from './contexts/AuthContext';
import Header from '~/components/layout/Header.jsx';
import DashboardPage from '~/pages/DashboardPage.jsx';
import NewInterviewPage from '~/pages/NewInterviewPage.jsx';
import InterviewReportPage from '~/pages/InterviewReportPage.jsx';
import LiveInterviewPage from '~/pages/LiveInterviewPage.jsx';
import LiveInterviewPageVoice from '~/pages/LiveInterviewPageVoice.jsx';
import NotFoundPage from '~/pages/NotFoundPage.jsx';
import LoginPage from '~/pages/LoginPage.jsx';
import RegisterPage from '~/pages/RegisterPage.jsx';
import ApiDocsPage from '~/pages/ApiDocsPage.jsx';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/new-interview" element={user ? <NewInterviewPage /> : <Navigate to="/login" />} />
          <Route path="/interview/:id" element={user ? <LiveInterviewPage /> : <Navigate to="/login" />} />
          <Route path="/interview/live/:id" element={<LiveInterviewPageVoice />} />
          <Route path="/report/:id" element={user ? <InterviewReportPage /> : <Navigate to="/login" />} />
          <Route path="/docs" element={<ApiDocsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
};
const App = () => {

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <AppContent />
    </div>
  );
};

export default App;

