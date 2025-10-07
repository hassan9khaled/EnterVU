import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Mic, Send, Loader2, CheckCircle, Clock, Target, User } from 'lucide-react';
import { getNextQuestion, submitAnswer, finishInterview } from '~/api/apiClient';
import Card from '~/components/common/Card';

const LiveInterviewPage = () => {
    const { id: interviewId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const totalQuestions = location.state?.totalQuestions;
    const [question, setQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const [questionCount, setQuestionCount] = useState({ current: 0, total: totalQuestions || 0 });
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const fetchNext = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await getNextQuestion(interviewId);

            if (response.data && response.data.id) {
                setQuestion(response.data);
                setQuestionCount(prev => ({ 
                    current: response.data.order || response.data.question_number,
                    total: response.data.total_questions || prev.total
                }));
            } else {
                setIsFinished(true);
                await finishInterview(interviewId);
                setTimeout(() => navigate(`/report/${interviewId}`), 2000);
            }
        } catch (err) {
            setError('Failed to fetch the next question. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNext();
    }, [interviewId]);

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!userAnswer.trim()) {
            setError('Please provide an answer.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await submitAnswer(interviewId, {
                question_id: question.id,
                user_answer: userAnswer,
            });
            
            setUserAnswer('');
            await fetchNext();
        } catch (err) {
            setError('Failed to submit your answer. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading && !question) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Preparing Your Interview</h3>
                    <p className="text-gray-600">Getting everything ready for you...</p>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Interview Complete!</h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Great job! We're analyzing your responses and generating your personalized feedback report.
                    </p>
                    <div className="animate-pulse text-sm text-gray-500">
                        Redirecting to your report...
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Interview Session</h1>
                    <p className="text-gray-600">Answer each question thoughtfully to get the best feedback</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Target className="h-5 w-5 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {questionCount.current}<span className="text-sm font-normal text-gray-500">/{questionCount.total}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Clock className="h-5 w-5 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">Time Elapsed</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {formatTime(timeElapsed)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <User className="h-5 w-5 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">Status</span>
                        </div>
                        <div className="text-lg font-semibold text-green-600">In Progress</div>
                    </div>
                </div>

                <Card className="p-8 shadow-lg border-0 rounded-2xl">
                    {/* Question Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                <span>Current Question</span>
                            </h3>
                            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                                Question {questionCount.current}
                            </span>
                        </div>

                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 min-h-[120px] flex items-center justify-center">
                            {isLoading ? (
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Loading next question...</p>
                                </div>
                            ) : (
                                <p className="text-xl font-medium text-gray-900 text-center leading-relaxed">
                                    {question?.content}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Answer Section */}
                    <form onSubmit={handleSubmitAnswer}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                <span>Your Answer</span>
                            </label>
                            
                            <div className="relative">
                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Type your detailed answer here... Be specific and provide examples from your experience."
                                    rows="6"
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-4 px-4 border resize-none transition-all duration-200"
                                    disabled={isSubmitting || isLoading}
                                />
                                
                                <div className="absolute bottom-4 right-4 flex space-x-2">
                                    <button
                                        type="button"
                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors bg-white rounded-lg shadow-sm border"
                                        title="Record Audio Answer"
                                    >
                                        <Mic className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-500">
                                    Minimum 50 characters recommended for detailed feedback
                                </span>
                                <span className={`text-sm ${userAnswer.length < 50 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {userAnswer.length} characters
                                </span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || isLoading || !userAnswer.trim()}
                                className="inline-flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-4 px-8 rounded-xl shadow-sm transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Submitting Answer...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Answer</span>
                                        <Send className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Card>

                {/* Tips Section */}
                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Interview Tips</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                            <span>Be specific and use examples from your experience</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                            <span>Structure your answer clearly (Situation, Task, Action, Result)</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                            <span>Take your time - there's no rush</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                            <span>Focus on your achievements and learnings</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveInterviewPage;