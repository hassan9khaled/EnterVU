// components/dashboard/CVList.jsx
import React, { useState } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { uploadCv, deleteCv } from '~/api/apiClient';
import { useAuth } from '~/contexts/AuthContext';

const CVList = ({ cvs, onCvUpload }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check if file is PDF
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        // Check file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError('');

        try {
            await uploadCv(file);
            // Refresh the CV list by calling the parent callback
            if (onCvUpload) {
                onCvUpload();
            }
            // Clear the file input
            event.target.value = '';
        } catch (err) {
            setError('Failed to upload CV. Please try again.');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCv = async (cvId, userId) => {
        if (!window.confirm('Are you sure you want to delete this CV?')) {
            return;
        }

        try {
            await deleteCv(cvId, userId);
            // Refresh the CV list
            if (onCvUpload) {
                onCvUpload();
            }
        } catch (err) {
            setError('Failed to delete CV. Please try again.');
            console.error('Delete error:', err);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your CVs</h2>
                <div className="relative">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="cv-upload"
                    />
                    <label
                        htmlFor="cv-upload"
                        className={`flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium cursor-pointer ${
                            uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                        }`}
                    >
                        <Upload className="h-4 w-4" />
                        <span>{uploading ? 'Uploading...' : 'Upload CV'}</span>
                    </label>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <div className="space-y-3">
                {cvs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No CVs uploaded yet</p>
                        <p className="text-sm mt-1">Upload your first CV to get started</p>
                    </div>
                ) : (
                    cvs.map((cv) => (
                        <div
                            key={cv.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                        >
                            <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {cv.file_name || cv.original_filename || 'CV File'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Uploaded on {new Date(cv.uploaded_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteCv(cv.id, user.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete CV"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
                <p>• Only PDF files are supported</p>
                <p>• Maximum file size: 10MB</p>
                <p>• Maximum Pages: 5</p>
            </div>
        </div>
    );
};

export default CVList;