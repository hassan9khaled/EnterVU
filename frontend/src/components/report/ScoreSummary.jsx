import React from 'react';
import Card from '../common/Card';

const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
};

const getRecommendationClass = (recommendation) => {
    if (recommendation === 'Strong Hire') return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
};

const ScoreSummary = ({ score, recommendation, summary }) => {
    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center justify-center text-center border-r-0 md:border-r md:border-gray-200 pr-0 md:pr-6">
                    <p className="text-sm text-gray-500">Overall Score</p>
                    <p className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}</p>
                    <span className={`mt-1 px-3 py-1 text-sm font-semibold rounded-full ${getRecommendationClass(recommendation)}`}>
                        {recommendation}
                    </span>
                </div>
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800">AI Summary & Feedback</h3>
                    <p className="mt-2 text-gray-700">{summary}</p>
                </div>
            </div>
        </Card>
    );
};

export default ScoreSummary;
