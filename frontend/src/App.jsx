import React from 'react';
import { Routes, Route } from 'react-router-dom'; // ← Only import Routes and Route
import Header from './components/layout/Header.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NewInterviewPage from './pages/NewInterviewPage.jsx';
import InterviewReportPage from './pages/InterviewReportPage.jsx';
import LiveInterviewPage from './pages/LiveInterviewPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/new-interview" element={<NewInterviewPage />} />
          <Route path="/report/:id" element={<InterviewReportPage />} />
          <Route path="/interview/:id" element={<LiveInterviewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;