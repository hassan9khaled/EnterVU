import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Briefcase, FileText as JobDescIcon, Loader2, AlertCircle, User, Target } from 'lucide-react';
import { getCvs, uploadCv, startInterview, getUser } from '../api/apiClient.js';
import Card from '../components/common/Card.jsx';
import { useAuth } from '~/contexts/AuthContext';

const NewInterviewPage = () => {
    const [cvs, setCvs] = useState([]);
    const [selectedCvId, setSelectedCvId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const initialize = async () => {
            try {
                if (user && user.id) {
                    setUserId(user.id);
                    const cvsResponse = await getCvs(user.id);
                    setCvs(cvsResponse.data);
                }
            } catch (err) {
                setError('Failed to load your CVs. Please try again later.');
                console.error(err);
            }
        };

        initialize();
    }, [user]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setSelectedCvId(''); // Deselect any existing CV
        }
    };

    const handleStartInterview = async (e) => {
        e.preventDefault();
        if (!userId) {
            setError('User not loaded. Please refresh the page.');
            return;
        }
        if (!jobTitle || (!selectedCvId && !file)) {
            setError('Please provide a job title and select or upload a CV.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            let cvIdToUse = selectedCvId;

            if (file) {
                const uploadResponse = await uploadCv(file);
                cvIdToUse = uploadResponse.data.id;
            }

            const interviewData = {
                user_id: userId,
                cv_id: cvIdToUse,
                job_title: jobTitle,
                job_description: jobDescription,
                mode: 'easy',
            };
            const interviewResponse = await startInterview(interviewData);
            navigate(`/interview/${interviewResponse.data.id}`, {
                state: { totalQuestions: interviewResponse.data.questions.length }
            });
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'An unexpected error occurred.';
            setError(errorMsg);
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
                    Start New Practice Interview
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Get personalized AI-powered interview practice tailored to your CV and target job role.
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-8">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                            1
                        </div>
                        <span className="text-sm font-medium text-gray-700 mt-2">Job Details</span>
                    </div>
                    <div className="w-16 h-1 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                            2
                        </div>
                        <span className="text-sm font-medium text-gray-500 mt-2">CV Selection</span>
                    </div>
                    <div className="w-16 h-1 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                            3
                        </div>
                        <span className="text-sm font-medium text-gray-500 mt-2">Interview</span>
                    </div>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleStartInterview} className="space-y-8">
                    {/* Job Information Section */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Target className="h-6 w-6 text-indigo-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Job Information</h2>
                        </div>

                        {/* Job Title */}
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                                Job Title *
                            </label>
                            <div className="relative">
                                <Briefcase className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                                <input
                                    id="jobTitle"
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist..."
                                    className="block w-full rounded-lg border-gray-300 pl-10 pr-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                                    required
                                />
                            </div>
                        </div>

                        {/* Job Description */}
                        <div>
                            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                Job Description (Optional)
                            </label>
                            <div className="relative">
                                <JobDescIcon className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                <textarea
                                    id="jobDescription"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here to get more tailored interview questions. Include key responsibilities, requirements, and skills mentioned in the job posting..."
                                    rows={6}
                                    className="block w-full rounded-lg border-gray-300 pl-10 pr-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border resize-none"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Adding a job description helps us create more relevant interview questions.
                            </p>
                        </div>
                    </div>

                    {/* CV Selection Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <User className="h-6 w-6 text-indigo-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Your CV</h2>
                        </div>

                        {/* Existing CVs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Existing CV
                            </label>
                            <select
                                value={selectedCvId}
                                onChange={(e) => {
                                    setSelectedCvId(e.target.value);
                                    setFile(null);
                                }}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-3 px-4"
                            >
                                <option value="" disabled>Choose from your uploaded CVs...</option>
                                {cvs.map(cv => (
                                    <option key={cv.id} value={cv.id}>
                                        {cv.filename || cv.original_filename || `CV ${cv.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-4 text-sm text-gray-500 font-medium">Or upload a new CV</span>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload New CV
                            </label>
                            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-indigo-400 ${file ? 'border-green-400 bg-green-50' : ''}`}>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className={`mx-auto h-12 w-12 ${file ? 'text-green-500' : 'text-gray-400'}`} />
                                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                                        <span className="relative rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                                            {file ? 'Change file' : 'Choose a file'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        PDF, DOC, DOCX up to 10MB
                                    </p>
                                </label>
                            </div>
                            
                            {file && (
                                <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-800">{file.name}</p>
                                        <p className="text-xs text-green-600">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center rounded-lg bg-indigo-600 py-4 px-6 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    Preparing Your Interview...
                                </>
                            ) : (
                                <>
                                    <Target className="mr-3 h-5 w-5" />
                                    Start Practice Interview
                                </>
                            )}
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-3">
                            Your interview will be tailored based on your CV and job preferences
                        </p>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default NewInterviewPage;