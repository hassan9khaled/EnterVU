import React from 'react';
import MethodBadge from './MethodBadge';
import CodeBlock from './CodeBlock';

const EndpointCard = ({ endpoint }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
                <div className="flex items-center gap-4 mb-3">
                    <MethodBadge method={endpoint.method} />
                    <span className="text-lg font-mono font-medium text-gray-800 break-all">{endpoint.url}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{endpoint.name}</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{endpoint.description}</p>
            </div>
            
            {(endpoint.exampleBody || endpoint.exampleResponse) && (
                <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 border-t border-gray-200">
                    {endpoint.exampleBody && (
                        <div className="p-4">
                            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Request Body</h4>
                            <CodeBlock code={endpoint.exampleBody} language="json" />
                        </div>
                    )}
                    {endpoint.exampleResponse && (
                         <div className="p-4 md:border-l border-gray-200">
                            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Example Response</h4>
                            <CodeBlock code={endpoint.exampleResponse} language="json" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EndpointCard;
