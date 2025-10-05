import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NewInterviewPage from './pages/NewInterviewPage.jsx';
import InterviewReportPage from './pages/InterviewReportPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/new-interview" element={<NewInterviewPage />} />
          <Route path="/report/:id" element={<InterviewReportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

