import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, Play, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '~/components/common/Card.jsx';

const ITEMS_PER_PAGE = 5; // Set how many interviews to show per page

const InterviewHistoryList = ({ interviews }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(interviews.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = interviews.slice(indexOfFirstItem, indexOfLastItem);
    
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    // --- End Pagination Logic ---

    const handleViewInterview = (interview) => {
        if (interview.status.toUpperCase() === 'IN_PROGRESS') {
            navigate(`/interview/${interview.id}`);
        } else {
            navigate(`/report/${interview.id}`);
        }
    };

    // (Helper functions: getStatusIcon, getStatusStyles, getButtonConfig, formatScore remain the same as your file)
    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-orange-500" />;
            case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />;
            default: return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };
    const getStatusStyles = (status) => {
        switch (status?.toUpperCase()) {
            case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getButtonConfig = (status) => {
        switch (status?.toUpperCase()) {
            case 'IN_PROGRESS': return { text: 'Continue', icon: <Play className="h-4 w-4" />, className: 'bg-orange-600 hover:bg-orange-700 text-white' };
            default: return { text: 'View Report', icon: <FileText className="h-4 w-4" />, className: 'bg-indigo-600 hover:bg-indigo-700 text-white' };
        }
    };
    const formatScore = (score) => {
        if (!score && score !== 0) return '-';
        return `${Math.round(score)}%`;
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-indigo-600" /> 
                    Interview History
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {interviews.length} session{interviews.length !== 1 ? 's' : ''}
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map(interview => { // Map over currentItems
                            const buttonConfig = getButtonConfig(interview.status);
                            return (
                                <tr key={interview.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {interview.job_title || 'General Interview'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(interview.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`text-sm font-bold ${
                                            interview.final_score >= 80 ? 'text-green-600' :
                                            interview.final_score >= 60 ? 'text-orange-600' :
                                            'text-red-600'
                                        }`}>
                                            {formatScore(interview.final_score)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(interview.status)}
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(interview.status)}`}>
                                                {interview.status?.replace('_', ' ') || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => handleViewInterview(interview)}
                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${buttonConfig.className}`}
                                        >
                                            {buttonConfig.icon}
                                            {buttonConfig.text}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {interviews.length === 0 && (
                    <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No interview sessions yet</p>
                        <p className="text-gray-400 text-sm mt-1">Start your first practice interview to see your history here</p>
                    </div>
                )}
            </div>

            {/* --- Pagination Component --- */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="ml-2">Previous</span>
                    </button>
                    <div className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </div>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <span className="mr-2">Next</span>
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </Card>
    );
};

export default InterviewHistoryList;

