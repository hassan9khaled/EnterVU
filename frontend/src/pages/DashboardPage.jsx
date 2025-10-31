import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import InterviewHistoryList from '~/components/dashboard/InterviewHistoryList';
import CVList from '~/components/dashboard/CVList'; // Import the CVList
import { getInterviews, getCvs } from '~/api/apiClient';
import { useAuth } from '~/contexts/AuthContext';

const DashboardPage = () => {
    const [interviews, setInterviews] = useState([]);
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Renamed fetchData to be more specific and wrapped in useCallback
    const fetchDashboardData = useCallback(async () => {
        if (!user?.id) {
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
    }, [user]); // Dependency is just the user object

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]); // Effect runs when the memoized function changes

    if (loading) {
        return <div className="text-center py-8">Loading your dashboard...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-8">{error}</div>;
    }

    if (!user) {
        return <div className="text-center text-red-500 py-8">Please log in to view your dashboard.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user.name || user.email?.split('@')[0] || 'User'}!
                    </h1>
                    <p className="text-gray-600 mt-1">Your interview practice sessions</p>
                </div>
                <Link
                    to="/new-interview"
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>New Interview</span>
                </Link>
            </div>

            {/* Main Content Area - Refactored into a grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Primary Column: Interview History */}
                <div className="lg:col-span-2">
                    <InterviewHistoryList interviews={interviews} />
                </div>
                
                {/* Secondary Column: CV List */}
                <div className="lg:col-span-1 space-y-6">
                    <CVList cvs={cvs} onCvUpload={fetchDashboardData} />
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;

