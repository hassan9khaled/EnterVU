import React from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';
import Card from '../common/Card';

const Transcript = ({ transcript }) => {
    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-500" />Interview Q&A
            </h3>
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-3">
                {transcript.map((item, index) => (
                    <div key={index}>
                        <p className="font-semibold text-gray-800 mb-2">Q: {item.question}</p>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md mb-3">{item.answer}</p>
                        <div className="text-sm bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                            <p className="font-semibold text-green-800 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" /> AI Feedback
                            </p>
                            <p className="text-green-700 mt-1">{item.feedback}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default Transcript;
