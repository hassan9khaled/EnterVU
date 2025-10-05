import React from 'react';
import CVList from '../components/dashboard/CVList.jsx';
import InterviewHistoryList from '../components/dashboard/InterviewHistoryList.jsx';

// Mock Data
const mockUserCvs = [
    { id: 1, name: 'HassanKhaled_SoftwareEngineer_CV.pdf', uploaded: '2025-10-02' },
    { id: 2, name: 'Hassan_Khaled_Resume_DataScience.pdf', uploaded: '2025-09-18' },
];

const mockInterviewHistory = [
    {
        id: 'intv_abc123',
        cvName: 'HassanKhaled_SoftwareEngineer_CV.pdf',
        date: '2025-10-04',
        overallScore: 88,
        status: 'Completed',
    },
    {
        id: 'intv_def456',
        cvName: 'Hassan_Khaled_Resume_DataScience.pdf',
        date: '2025-09-20',
        overallScore: 92,
        status: 'Completed',
    }
];

const DashboardPage = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, Hassan!</h1>
                <p className="text-gray-600 mt-1">Here's a summary of your interview practice sessions.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <CVList cvs={mockUserCvs} />
                </div>
                <div className="lg:col-span-2">
                    <InterviewHistoryList interviews={mockInterviewHistory} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

