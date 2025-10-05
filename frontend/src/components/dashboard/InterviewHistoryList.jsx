import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight } from 'lucide-react';
import Card from '../common/Card';

const InterviewHistoryList = ({ interviews }) => {
    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gray-500" /> Interview History
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CV Used</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {interviews.map(interview => (
                            <tr key={interview.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm">{interview.date}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm truncate max-w-xs">{interview.cvName}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold">{interview.overallScore}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {interview.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right">
                                    <Link to={`/report/${interview.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center justify-end gap-1">
                                        View Details <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default InterviewHistoryList;
