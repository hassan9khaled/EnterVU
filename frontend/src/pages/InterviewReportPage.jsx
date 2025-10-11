import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ScoreSummary from '~/components/report/ScoreSummary.jsx';
import Transcript from '~/components/report/Transcript.jsx';
import FeedbackCard from '~/components/report/FeedbackCard.jsx';
import { getInterviewReport } from '~/api/apiClient.js';

const InterviewReportPage = () => {
    const { id } = useParams();
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
                setError('Failed to fetch interview report.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) {
        return <div className="text-center">Loading interview report...</div>;
    }

    if (error || !interview) {
        return (
            <div className="text-center text-red-500">
                <p>{error || 'Interview data could not be loaded.'}</p>
                <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Go back to Dashboard</Link>
            </div>
        );
    }
    
    const transcriptData = interview.questions.map(q => ({
        question: q.content,
        answer: q.answer ? q.answer.user_answer : 'No answer was provided.',
        feedback: q.answer ? q.answer.feedback : 'No feedback available.',
        score: q.answer ? q.answer.score : null,
    }));

    const formattedDate = new Date(interview.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="space-y-8">
            <div>
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Interview Report</h1>
                <p className="text-gray-500 mt-1">
                    For "{interview.job_title}" on {formattedDate}
                </p>
            </div>
            
            <ScoreSummary 
                score={Math.trunc(interview.final_score)} 
                recommendation={interview.decision} 
                summary={interview.report ? interview.report.content : 'The final report summary has not been generated yet.'} 
            />

            {interview.report && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FeedbackCard
                        title="Strengths"
                        points={interview.report.strengths || []}
                        type="strength"
                    />
                    <FeedbackCard
                        title="Areas for Improvement"
                        points={interview.report.areas_for_improvement || []}
                        type="improvement"
                    />
                </div>
            )}

            <div className="w-full">
                 <Transcript transcript={transcriptData} />
            </div>
        </div>
    );
};

export default InterviewReportPage;
