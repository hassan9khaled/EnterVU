import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import CVList from '~/components/dashboard/CVList';
import InterviewHistoryList from '~/components/dashboard/InterviewHistoryList';
import { getInterviews, getCvs } from '~/api/apiClient';
import { useAuth } from '~/contexts/AuthContext';

const DashboardPage = () => {
    const [interviews, setInterviews] = useState([]);
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const { user } = useAuth();

    const fetchData = async () => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [interviewsResponse, cvsResponse] = await Promise.all([
                getInterviews(user.id),
                getCvs(user.id)
            ]);

            setInterviews(interviewsResponse.data);
            setCvs(cvsResponse.data);

        } catch (err) {
            setError('Failed to fetch data. Please make sure the backend server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, refreshTrigger]);

    const handleCvUpload = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (loading) {
        return <div className="text-center">Loading your dashboard...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!user) {
        return <div className="text-center text-red-500">Please log in to view your dashboard.</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header Section with New Interview Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome back, {user.name || user.email?.split('@')[0] || 'User'}!
                    </h1>
                    <p className="text-gray-600 mt-1">Here's a summary of your interview practice sessions.</p>
                </div>
                <Link
                    to="/new-interview"
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Interview</span>
                </Link>
            </div>

            {/* Quick Actions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Plus className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Start New Interview</h3>
                            <p className="text-gray-600 text-sm">Practice with AI-powered interviews</p>
                        </div>
                    </div>
                    <Link
                        to="/new-interview"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-center block"
                    >
                        Start Practice Interview
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Upload className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Upload CV</h3>
                            <p className="text-gray-600 text-sm">Get personalized interview questions</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                        Upload your CV to get tailored interview questions based on your experience.
                    </p>
                </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <CVList cvs={cvs} onCvUpload={handleCvUpload} />
                </div>
                <div className="lg:col-span-2">
                    <InterviewHistoryList interviews={interviews} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;