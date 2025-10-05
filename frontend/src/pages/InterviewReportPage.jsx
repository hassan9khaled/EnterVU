import React from 'react';
import { useParams } from 'react-router-dom';

const InterviewReportPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold">Interview Report</h1>
      <p className="mt-2 text-gray-600">Showing detailed feedback for interview ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{id}</span></p>
    </div>
  );
};

export default InterviewReportPage;
