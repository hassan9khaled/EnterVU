import React from 'react';

const CodeBlock = ({ code, language }) => {
    // A real implementation would use a syntax highlighting library like Prism.js or highlight.js
    // For simplicity, we'll use a styled <pre> tag.
    return (
        <pre className={`bg-gray-800 text-white text-sm p-4 rounded-lg overflow-x-auto language-${language}`}>
            <code>{code}</code>
        </pre>
    );
};

export default CodeBlock;
