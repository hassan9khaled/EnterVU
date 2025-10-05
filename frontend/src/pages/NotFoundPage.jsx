import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center">
      <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
      <p className="text-2xl font-semibold mt-4">Page Not Found</p>
      <p className="text-gray-600 mt-2">Sorry, we couldn't find the page you're looking for.</p>
      <Link to="/" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
