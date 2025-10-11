import React, { useState } from 'react';
import { MessageSquare, CheckCircle, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import Card from '../common/Card';

const Transcript = ({ transcript }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? transcript.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === transcript.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const currentItem = transcript[currentIndex];

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-gray-500" />Interview Q&A
                </h3>
                <div className="text-sm font-medium text-gray-600">
                    Question {currentIndex + 1} of {transcript.length}
                </div>
            </div>

            <div className="relative overflow-hidden min-h-[300px]">
                {currentItem && (
                    <div className="space-y-6">
                        <div>
                            <p className="font-semibold text-gray-800 mb-2">Q: {currentItem.question}</p>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded-md mb-3">{currentItem.answer}</p>
                            <div className="text-sm bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                                <p className="font-semibold text-green-800 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" /> AI Feedback
                                </p>
                                <p className="text-green-700 mt-1">{currentItem.feedback}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center mt-6 space-x-4">
                <button 
                    onClick={goToPrevious}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
                    aria-label="Previous question"
                >
                    <ArrowLeftCircle className="h-8 w-8" />
                </button>
                <div className="flex space-x-2">
                    {transcript.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                currentIndex === index ? 'bg-indigo-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to question ${index + 1}`}
                        />
                    ))}
                </div>
                <button 
                    onClick={goToNext}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
                    aria-label="Next question"
                >
                    <ArrowRightCircle className="h-8 w-8" />
                </button>
            </div>
        </Card>
    );
};

export default Transcript;
