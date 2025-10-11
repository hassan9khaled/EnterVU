import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { getNextQuestion, submitAnswer, finishInterview } from '~/api/apiClient';
import Card from '~/components/common/Card';

const LiveInterviewPage = () => {
    const { id: interviewId } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const [questionCount, setQuestionCount] = useState({ current: 0, total: 0 });

    const fetchNext = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await getNextQuestion(interviewId);

            if (response.data && response.data.question) {
                setQuestion(response.data.question);
                setQuestionCount(prev => ({ 
                    current: response.data.question.order,
                    total: response.data.total_questions || prev.total
                }));
            } else if (response.data && response.data.message) {
                setIsFinished(true);
                await finishInterview(interviewId);
                setTimeout(() => navigate(`/report/${interviewId}`), 1000);
            } else {
                setError('Unexpected response from server.');
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
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Question {questionCount.current} of {questionCount.total}
                        </span>
                        <span className="text-sm text-gray-500">
                            {Math.round((questionCount.current / questionCount.total) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(questionCount.current / questionCount.total) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <Card className="p-8 shadow-sm border border-gray-200 rounded-xl">
                    {/* Question Section */}
                    <div className="mb-8">
                        <div className="mb-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                                Question {questionCount.current}
                            </span>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 min-h-[120px] flex items-center">
                            {isLoading ? (
                                <div className="text-center w-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Loading next question...</p>
                                </div>
                            ) : (
                                <p className="text-xl font-medium text-gray-900 leading-relaxed">
                                    {question?.content}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Answer Section */}
                    <form onSubmit={handleSubmitAnswer}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Your Answer
                            </label>
                            
                            <div className="relative">
                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Type your detailed answer here... Be specific and provide examples from your experience."
                                    rows="6"
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border resize-none transition-colors"
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-500">
                                    Minimum 50 characters recommended
                                </span>
                                <span className={`text-sm ${userAnswer.length < 50 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {userAnswer.length} characters
                                </span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || isLoading || !userAnswer.trim()}
                                className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Answer</span>
                                        <Send className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default LiveInterviewPage;