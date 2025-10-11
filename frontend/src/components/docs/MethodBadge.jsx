import React from 'react';

const MethodBadge = ({ method }) => {
    const methodColors = {
        GET: 'bg-green-100 text-green-800',
        POST: 'bg-blue-100 text-blue-800',
        PATCH: 'bg-yellow-100 text-yellow-800',
        DELETE: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`px-3 py-1 text-sm font-bold rounded-md ${methodColors[method] || 'bg-gray-100 text-gray-800'}`}>
            {method}
        </span>
    );
};

export default MethodBadge;
