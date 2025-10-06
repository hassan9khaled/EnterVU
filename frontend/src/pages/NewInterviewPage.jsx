import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { getCvs, uploadCv, startInterview, getUser} from '../api/apiClient.js';
import Card from '../components/common/Card.jsx';

const NewInterviewPage = () => {
    const [cvs, setCvs] = useState([]);
    const [selectedCvId, setSelectedCvId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const initialize = async () => {
        try {
            // Step 1: Get user (adjust logic if you already have user ID)
            const userResponse = await getUser(1); 
            setUserId(userResponse.data.id);

            // Step 2: Fetch CVs
            const cvsResponse = await getCvs();
            setCvs(cvsResponse.data);
        } catch (err) {
            setError('Failed to load user or CVs. Please log in again.');
            console.error(err);
        }
        };

        initialize();
    }, []);
    // useEffect(() => {
    //     const fetchCvs = async () => {
    //         try {
    //             const response = await getCvs();
    //             setCvs(response.data);
    //         } catch (err) {
    //             setError('Failed to load your CVs. Please try again later.');
    //         }
    //     };
    //     fetchCvs();
    // }, []);

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
            const uploadResponse = await uploadCv(file, userId);
            cvIdToUse = uploadResponse.data.id;
        }

        const interviewData = {
            user_id: userId,
            cv_id: cvIdToUse,
            job_title: jobTitle,
            mode: 'easy',
        };
        const interviewResponse = await startInterview(interviewData);
        navigate(`/interview/${interviewResponse.data.id}`);
        } catch (err) {
        const errorMsg = err.response?.data?.detail || 'An unexpected error occurred.';
        setError(errorMsg);
        setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
             <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Start New Practice Interview</h1>
             <Card>
                <form onSubmit={handleStartInterview} className="space-y-6">
                    <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title to Practice For
                        </label>
                        <div className="relative">
                             <Briefcase className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                            <input
                                id="jobTitle"
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="e.g., Senior Software Engineer"
                                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                            Choose Your CV
                        </label>
                        {/* CV Selector */}
                        <select
                            value={selectedCvId}
                            onChange={(e) => {
                                setSelectedCvId(e.target.value);
                                setFile(null); // Deselect file on dropdown change
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="" disabled>Select an existing CV...</option>
                            {cvs.map(cv => (
                                <option key={cv.id} value={cv.id}>{cv.file_name}</option>
                            ))}
                        </select>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-2 text-sm text-gray-500">Or</span>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                                        <span>Upload a new CV</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                            </div>
                        </div>
                         {file && (
                            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                                <FileText className="h-5 w-5 text-green-500" />
                                <span>{file.name}</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</>
                        ) : (
                            'Start Interview Session'
                        )}
                    </button>
                </form>
             </Card>
        </div>
    );
};

export default NewInterviewPage;

