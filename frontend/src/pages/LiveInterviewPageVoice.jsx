import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '~/contexts/AuthContext';
import { useAudioStream } from '../hooks/useAudioStream';
import { getInterviewReport } from '~/api/apiClient';
import { Keyboard } from 'lucide-react';

const LiveInterviewPageVoice = () => {
    const { id: interviewId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [interviewTime, setInterviewTime] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState('Click "Start Interview" to begin...');
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [error, setError] = useState('');
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [isCheckingInterview, setIsCheckingInterview] = useState(true);
    
    const { isConnected, messages, isInterviewFinished, startStreaming, stopStreaming } = useAudioStream(user?.id, interviewId);

    const timerRef = useRef(null);
    useEffect(() => {
        if (isInterviewFinished) {
            console.log("Interview finished, redirecting to report page...");
            stopStreaming(); 
            if (timerRef.current) clearInterval(timerRef.current);
            navigate(`/report/${interviewId}`);
        }
    }, [isInterviewFinished, navigate, interviewId, stopStreaming]);
    
    useEffect(() => {
        const agentMessages = messages.filter(msg => msg.type === 'agent' && msg.text);
        if (agentMessages.length > 0) {
            const latestMessage = agentMessages[agentMessages.length - 1];
            if (latestMessage.text.trim()) {
                setCurrentQuestion(latestMessage.text);
                setIsAISpeaking(true);
                setTimeout(() => setIsAISpeaking(false), 3000); 
            }
        }
    }, [messages]);

    useEffect(() => {
        const checkInterviewStatus = async () => {
            try {
                setIsCheckingInterview(true);
                const res = await getInterviewReport(interviewId);
                const interview = res?.data;

                if (interview && interview.final_score) {
                    console.log("✅ Interview already finished, redirecting...");
                    setTimeout(() => navigate(`/report/${interviewId}`), 1000);   
                }
            } catch (error) {
                console.error("Error checking interview status:", error);
                setError('Failed to verify interview status. Please try again.');
            } finally {
                setIsCheckingInterview(false);
            }
        };

        if (interviewId) {
            checkInterviewStatus();
        } else {
            setIsCheckingInterview(false);
            setError('Interview ID not found');
        }
    }, [interviewId, navigate]);

    useEffect(() => {
        if (interviewStarted && user?.id && interviewId) {
            startStreaming().then(success => {
                if (success) {
                    timerRef.current = setInterval(() => setInterviewTime(prev => prev + 1), 1000);
                    setCurrentQuestion('Connecting to interview...');
                } else {
                    setError('Could not connect to the interview. Please ensure your browser supports audio streaming.');
                    setInterviewStarted(false);
                }
            }).catch(err => {
                console.error('Error starting audio stream:', err);
                setError('An unexpected error occurred while connecting to the interview.');
                setInterviewStarted(false);
            });
        }
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (!interviewStarted) {
                stopStreaming();
            }
        };
    }, [interviewStarted, user?.id, interviewId, startStreaming, stopStreaming]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleStartInterview = async () => {
        setError('');
        setInterviewStarted(true);
        setCurrentQuestion('Initializing interview...');
    };

    const handleEndInterview = () => {
        stopStreaming();
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setInterviewStarted(false);
        navigate(`/report/${interviewId}`);
    };

    if (isCheckingInterview) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking interview status...</p>
                    <p className="text-sm text-gray-500 mt-2">Verifying if interview can be started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-3xl p-4 text-center">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                            interviewStarted 
                                ? (isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse') 
                                : 'bg-gray-500'
                        }`} />
                        <span className="text-gray-600 font-medium">
                            {interviewStarted 
                                ? (isConnected ? 'Live' : 'Connecting...') 
                                : 'Ready to Start'
                            }
                        </span>
                    </div>
                    {interviewStarted && (
                        <div className="text-2xl font-mono text-gray-700">{formatTime(interviewTime)}</div>
                    )}
                    <button
                        onClick={() => navigate(`/interview/${interviewId}`)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <Keyboard className="h-4 w-4" />
                        <span>Switch to Text Interview</span>
                    </button>
                </div>

                <div className="mb-8">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                        {interviewStarted 
                            ? (isAISpeaking ? 'AI is Speaking' : 'Current Question')
                            : 'Interview Status'
                        }
                    </p>
                    <h1 className="text-3xl font-light text-gray-800 leading-tight">
                        {currentQuestion}
                    </h1>
                </div>

                {interviewStarted && (
                    <div className="mb-10 text-sm text-gray-500">
                        {isAISpeaking ? "Listen carefully..." : "Your turn. Start speaking to answer."}
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    {!interviewStarted ? (
                        <button 
                            onClick={handleStartInterview}
                            className="bg-green-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-green-700 transition-colors"
                        >
                            Start Interview
                        </button>
                    ) : (
                        <button 
                            onClick={handleEndInterview}
                            className="bg-red-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-red-700 transition-colors"
                        >
                            End Interview
                        </button>
                    )}
                </div>

                {error && <p className="text-red-500 mt-4">{error}</p>}

                {!interviewStarted && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                            <strong>Before you start:</strong> Ensure your microphone and speakers are working properly. 
                            You'll need to allow microphone access when prompted.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveInterviewPageVoice;