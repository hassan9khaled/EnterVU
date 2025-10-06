import React from 'react';
import { FileText, Upload } from 'lucide-react';
import Card from '../common/Card.jsx';

const CVList = ({ cvs }) => {
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" /> My CVs
                </h3>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                    <Upload className="h-4 w-4" />
                    Upload New
                </button>
            </div>
            <div className="space-y-3">
                {cvs.map(cv => (
                    <div key={cv.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <p className="font-medium text-gray-800 truncate">{cv.file_name}</p>
                        <p className="text-xs text-gray-500">Uploaded: {cv.uploaded_at ? new Date(cv.uploaded_at).toLocaleDateString('en-CA') : 'Invalid date'}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default CVList;

