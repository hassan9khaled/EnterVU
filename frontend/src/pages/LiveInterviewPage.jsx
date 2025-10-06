import React from 'react';
import { useParams } from 'react-router-dom';

const LiveInterviewPage = () => {
    const { id } = useParams();

    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">Live Interview Session</h1>
            <p className="mt-2 text-gray-600">Interview ID: {id}</p>
            <p className="mt-4 text-lg font-semibold">This page is under construction.</p>
        </div>
    );
};

export default LiveInterviewPage;
