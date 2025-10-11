import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Briefcase, FileText as JobDescIcon, Loader2, AlertCircle, User, Target, Hash, Mic, Type, X, BrainCircuit, BarChart, Zap, Sparkles, Settings, BookOpen } from 'lucide-react';
import { getCvs, uploadCv, startInterview } from '../api/apiClient.js';
import Card from '../components/common/Card.jsx';
import { useAuth } from '~/contexts/AuthContext';

const NewInterviewPage = () => {
    const [cvs, setCvs] = useState([]);
    const [selectedCvId, setSelectedCvId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    
    // New state variables
    const [skillsToFocus, setSkillsToFocus] = useState([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const [difficulty, setDifficulty] = useState('easy');
    const [interviewMode, setInterviewMode] = useState('text');

    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const initialize = async () => {
            if (user && user.id) {
                try {
                    const cvsResponse = await getCvs(user.id);
                    setCvs(cvsResponse.data);
                } catch (err) {
                    setError('Failed to load your CVs. Please try again later.');
                    console.error(err);
                }
            }
        };
        initialize();
    }, [user]);
    
    const handleAddSkill = () => {
        if (currentSkill.trim() && !skillsToFocus.includes(currentSkill.trim())) {
            setSkillsToFocus([...skillsToFocus, currentSkill.trim()]);
            setCurrentSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkillsToFocus(skillsToFocus.filter(skill => skill !== skillToRemove));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setSelectedCvId('');
        }
    };

    const handleStartInterview = async (e) => {
        e.preventDefault();
        if (!user || !user.id) {
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
                const uploadResponse = await uploadCv(file, user.id);
                cvIdToUse = uploadResponse.data.id;
            }

            const interviewData = {
                user_id: user.id,
                cv_id: parseInt(cvIdToUse, 10),
                job_title: jobTitle,
                job_description: jobDescription,
                skills_to_foucs: skillsToFocus,
                mode: difficulty,
            };

            // const interviewResponse = await startInterview(interviewData);
            
            // Updated navigation logic for live voice interviews
            const destination = interviewMode === 'live' 
                ? `/interview/live/${1}`  // Redirect to live voice interview page
                : `/interview/${1}`;      // Regular text interview

            navigate(destination, {
                state: { 
                    totalQuestions: 10 || 0,
                    interviewMode: interviewMode 
                }
            });

        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'An unexpected error occurred.';
            setError(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
            setIsLoading(false);
        }
    };

    // Difficulty configuration
    const difficultyConfig = {
        easy: {
            label: 'Easy',
            description: 'Great for beginners',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            ringColor: 'ring-emerald-500'
        },
        medium: {
            label: 'Medium',
            description: 'Balanced challenge',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            ringColor: 'ring-amber-500'
        },
        hard: {
            label: 'Hard',
            description: 'Expert level questions',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            ringColor: 'ring-red-500'
        }
    };

    // Mode configuration
    const modeConfig = {
        text: {
            label: 'Text Interview',
            description: 'Type your answers',
            icon: Type,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            ringColor: 'ring-blue-500'
        },
        live: {
            label: 'Live Voice Interview',
            description: 'Real-time voice conversation with AI',
            icon: Mic,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            ringColor: 'ring-purple-500'
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="relative">
                        <Sparkles className="h-8 w-8 text-indigo-600 mb-2" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    Start New Practice Interview
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Customize your AI-powered interview session for a perfectly tailored practice experience.
                </p>
            </div>

            <Card className="p-8 shadow-lg border-0">
                <form onSubmit={handleStartInterview} className="space-y-10">
                    {/* --- Job Information Section --- */}
                    <section className="space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Job Information</h2>
                                <p className="text-sm text-gray-500">Tell us about the role you're preparing for</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-6">
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
                                        placeholder="e.g., Senior Software Engineer, Frontend Developer, Data Scientist..."
                                        className="block w-full rounded-lg border-gray-300 pl-10 pr-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border transition-colors" 
                                        required 
                                    />
                                </div>
                            </div>
                            
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
                                        placeholder="Paste the job description here for more tailored and relevant questions..."
                                        rows={5} 
                                        className="block w-full rounded-lg border-gray-300 pl-10 pr-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border resize-none transition-colors" 
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- Skills to Focus On Section --- */}
                    <section className="space-y-6 pt-8 border-t border-gray-100">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Hash className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Skills to Focus On</h2>
                                <p className="text-sm text-gray-500">Optional - specify skills for targeted questions</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                                    Add specific skills or technologies
                                </label>
                                <div className="flex gap-3">
                                    <input 
                                        id="skills" 
                                        type="text" 
                                        value={currentSkill} 
                                        onChange={(e) => setCurrentSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                        placeholder="Type a skill (e.g., Python, React, AWS) and press Enter"
                                        className="flex-grow rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border px-4 py-3 transition-colors" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddSkill}
                                        className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                            
                            {skillsToFocus.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {skillsToFocus.map(skill => (
                                        <span 
                                            key={skill} 
                                            className="flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-2 rounded-lg border border-green-200"
                                        >
                                            {skill}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveSkill(skill)} 
                                                className="text-green-500 hover:text-green-700 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* --- Interview Settings Section --- */}
                    <section className="space-y-6 pt-8 border-t border-gray-100">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Settings className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Interview Settings</h2>
                                <p className="text-sm text-gray-500">Customize the interview experience</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-8">
                            {/* Difficulty Level */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Difficulty Level *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(difficultyConfig).map(([level, config]) => {
                                        const isSelected = difficulty === level;
                                        const Icon = level === 'easy' ? BookOpen : level === 'medium' ? BarChart : BrainCircuit;
                                        return (
                                            <button 
                                                type="button" 
                                                key={level} 
                                                onClick={() => setDifficulty(level)}
                                                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                                                    isSelected 
                                                        ? `${config.bgColor} ${config.borderColor} ring-2 ${config.ringColor} ring-opacity-50 transform scale-105` 
                                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                }`}
                                            >
                                                <Icon className={`h-6 w-6 mb-3 ${isSelected ? config.color : 'text-gray-400'}`} />
                                                <div className={`font-semibold capitalize mb-1 ${isSelected ? config.color : 'text-gray-700'}`}>
                                                    {config.label}
                                                </div>
                                                <div className="text-xs text-gray-500">{config.description}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Interview Mode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Interview Mode *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(modeConfig).map(([mode, config]) => {
                                        const isSelected = interviewMode === mode;
                                        const Icon = config.icon;
                                        return (
                                            <button 
                                                type="button" 
                                                key={mode} 
                                                onClick={() => setInterviewMode(mode)}
                                                className={`p-6 rounded-xl border-2 text-center transition-all duration-200 ${
                                                    isSelected 
                                                        ? `${config.bgColor} ${config.borderColor} ring-2 ${config.ringColor} ring-opacity-50 transform scale-105` 
                                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                }`}
                                            >
                                                <Icon className={`h-8 w-8 mb-3 mx-auto ${isSelected ? config.color : 'text-gray-400'}`} />
                                                <div className={`font-semibold mb-1 ${isSelected ? config.color : 'text-gray-700'}`}>
                                                    {config.label}
                                                </div>
                                                <div className="text-xs text-gray-500">{config.description}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- CV Selection Section --- */}
                    <section className="space-y-6 pt-8 border-t border-gray-100">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <User className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Your CV</h2>
                                <p className="text-sm text-gray-500">Select an existing CV or upload a new one</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-6">
                            {/* Existing CVs */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Existing CV
                                </label>
                                <select 
                                    value={selectedCvId} 
                                    onChange={(e) => { setSelectedCvId(e.target.value); setFile(null); }} 
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border py-3 px-4 transition-colors"
                                >
                                    <option value="" disabled>Choose from your uploaded CVs...</option>
                                    {cvs.map(cv => (
                                        <option key={cv.id} value={cv.id}>
                                            {cv.file_name || `CV #${cv.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-sm text-gray-500 font-medium">Or</span>
                                </div>
                            </div>
                            
                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Upload New CV
                                </label>
                                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                    file 
                                        ? 'border-green-400 bg-green-50 shadow-sm' 
                                        : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
                                }`}>
                                    <input 
                                        id="file-upload" 
                                        type="file" 
                                        className="sr-only" 
                                        onChange={handleFileChange} 
                                        accept=".pdf" 
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className={`mx-auto h-12 w-12 mb-4 ${
                                            file ? 'text-green-500' : 'text-gray-400'
                                        }`} />
                                        <div className="text-sm text-gray-600">
                                            <span className={`font-medium ${
                                                file ? 'text-green-600' : 'text-orange-600'
                                            } underline`}>
                                                {file ? 'Change file' : 'Choose a PDF file'}
                                            </span>
                                            <span className="ml-1">or drag and drop</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">PDF up to 10MB</p>
                                    </label>
                                </div>
                                
                                {file && (
                                    <div className="mt-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-green-800 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-green-600">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setFile(null)} 
                                            className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Error Display */}
                    {error && (
                        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-8 border-t border-gray-100">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full flex justify-center items-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 px-6 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    Preparing Your Interview...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-3 h-5 w-5" />
                                    Start Practice Interview
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default NewInterviewPage;