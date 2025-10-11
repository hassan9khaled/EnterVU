import React, { useState } from 'react';
import { apiDocsData } from '~/data/apiDocsData';
import EndpointCard from '~/components/docs/EndpointCard';

const ApiDocsPage = () => {
    const [activeSection, setActiveSection] = useState(apiDocsData[0]?.name || '');

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Sidebar Navigation */}
            <aside className="lg:w-1/4 lg:sticky top-24 self-start">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">API Sections</h2>
                <nav>
                    <ul className="space-y-2">
                        {apiDocsData.map(section => (
                            <li key={section.name}>
                                <a
                                    href={`#${section.name.replace(/\s+/g, '-')}`}
                                    onClick={() => setActiveSection(section.name)}
                                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                        activeSection === section.name
                                            ? 'bg-indigo-100 text-indigo-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {section.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                        API Documentation
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Welcome to the developer documentation for the EnterVU API.
                    </p>
                </div>

                <div className="space-y-12">
                    {apiDocsData.map(section => (
                        <section key={section.name} id={section.name.replace(/\s+/g, '-')}>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">{section.name}</h2>
                                {section.description && <p className="mt-2 text-gray-500">{section.description}</p>}
                            </div>
                            <div className="space-y-8">
                                {section.endpoints.map(endpoint => (
                                    <EndpointCard key={endpoint.url + endpoint.method} endpoint={endpoint} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ApiDocsPage;
