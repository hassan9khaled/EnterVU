import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ScoreSummary from '~/components/report/ScoreSummary.jsx';
import SkillBreakdown from '~/components/report/SkillBreakdown.jsx';
import Transcript from '~/components/report/Transcript.jsx';

// Mock Data for a single Interview Report
const mockInterviewReport = {
    id: 'intv_abc123',
    date: '2025-10-04',
    overallScore: 88,
    recommendation: 'Good Fit',
    summary: "Hassan demonstrated strong technical skills in Python and a solid understanding of data structures. His problem-solving approach was methodical. Communication was clear, though some answers on system design could have been more detailed. Overall, a very capable candidate.",
    skillBreakdown: [
        { skill: 'Python Proficiency', score: 92 },
        { skill: 'Data Structures & Algorithms', score: 90 },
        { skill: 'System Design', score: 80 },
        { skill: 'Communication', score: 85 },
        { skill: 'Behavioral', score: 89 },
    ],
    transcript: [
        {
            question: "Can you explain the difference between a list and a tuple in Python?",
            answer: "A list is mutable, meaning its elements can be changed, while a tuple is immutable. I'd use a list for a collection of items that might need to change, and a tuple for data that should remain constant, like coordinates.",
            feedback: "Excellent. Your answer was accurate and you provided a great practical example."
        },
        {
            question: "How would you approach designing a scalable web scraper?",
            answer: "I would start with a message queue like RabbitMQ to manage the URLs to be scraped. Worker services would then pick up URLs, fetch the content, parse it, and store the results in a database. This architecture allows for easy scaling by just adding more workers.",
            feedback: "This is a solid architectural approach. You correctly identified key components for scalability like a message queue and distributed workers."
        }
    ]
};

const InterviewReportPage = () => {
    const { id } = useParams();
    // In a real app, you'd use the `id` to fetch data. Here, we'll just use the mock data.
    const report = mockInterviewReport;

    return (
        <div className="space-y-6">
            <div>
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Interview Report</h1>
                <p className="text-gray-500 mt-1">
                    Report for interview session on {report.date}
                </p>
            </div>
            
            <ScoreSummary 
                score={report.overallScore} 
                recommendation={report.recommendation} 
                summary={report.summary} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1">
                    <SkillBreakdown skills={report.skillBreakdown} />
                </div>
                <div className="lg:col-span-2">
                    <Transcript transcript={report.transcript} />
                </div>
            </div>
        </div>
    );
};

export default InterviewReportPage;

