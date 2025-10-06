import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ScoreSummary from '~/components/report/ScoreSummary.jsx';
import SkillBreakdown from '~/components/report/SkillBreakdown.jsx';
import Transcript from '~/components/report/Transcript.jsx';
import { getInterviewReport } from '~/api/apiClient.js';

const InterviewReportPage = () => {
    const { id } = useParams(); // Get the interview ID from the URL
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);
                const response = await getInterviewReport(id);
                setInterview(response.data);
            } catch (err) {
                setError('Failed to fetch interview report. It might not exist or the server may be down.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]); // Re-run the effect if the ID in the URL changes

    if (loading) {
        return <div className="text-center">Loading interview report...</div>;
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                <p>{error}</p>
                <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Go back to Dashboard</Link>
            </div>
        );
    }

    // Check if the interview data or the nested report is missing
    if (!interview) {
        return <div className="text-center">No interview data available.</div>;
    }
    
    if (!interview.report) {
        return (
             <div className="text-center">
                <p>The report for this interview has not been generated yet.</p>
                <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Go back to Dashboard</Link>
            </div>
        )
    }

    // Helper to format the date
    const formattedDate = new Date(interview.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="space-y-6">
            <div>
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Interview Report</h1>
                <p className="text-gray-500 mt-1">
                    Report for interview session on {formattedDate}
                </p>
            </div>
            
            <ScoreSummary 
                score={interview.score} 
                recommendation={interview.decision} 
                summary={interview.report.summary} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1">
                    <SkillBreakdown skills={interview.report.skillBreakdown} />
                </div>
                <div className="lg:col-span-2">
                    <Transcript transcript={interview.report.transcript} />
                </div>
            </div>
        </div>
    );
};

export default InterviewReportPage;

