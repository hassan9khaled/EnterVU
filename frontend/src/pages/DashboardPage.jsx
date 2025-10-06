import React, { useState, useEffect } from 'react';
import CVList from '~/components/dashboard/CVList';
import InterviewHistoryList from '~/components/dashboard/InterviewHistoryList';
import { getInterviews, getCvs } from '~/api/apiClient';

const DashboardPage = () => {
    // State to hold our data, loading status, and any potential errors
    const [interviews, setInterviews] = useState([]);
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect hook to fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Set loading to true before starting the fetch
                setLoading(true);
                setError(null);

                // Fetch both interviews and CVs in parallel
                const [interviewsResponse, cvsResponse] = await Promise.all([
                    getInterviews(),
                    getCvs()
                ]);

                // Update state with the data from the API
                setInterviews(interviewsResponse.data);
                setCvs(cvsResponse.data);

            } catch (err) {
                // If an error occurs, update the error state
                setError('Failed to fetch data. Please make sure the backend server is running.');
                console.error(err);
            } finally {
                // Set loading to false once the fetch is complete (either success or fail)
                setLoading(false);
            }
        };

        fetchData();
    }, []); // The empty dependency array means this effect runs only once on mount

    // Conditional rendering based on the loading and error states
    if (loading) {
        return <div className="text-center">Loading your dashboard...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, Hassan!</h1>
                <p className="text-gray-600 mt-1">Here's a summary of your interview practice sessions.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <CVList cvs={cvs} />
                </div>
                <div className="lg:col-span-2">
                    <InterviewHistoryList interviews={interviews} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

