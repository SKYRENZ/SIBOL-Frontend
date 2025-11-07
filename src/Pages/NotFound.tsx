import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
      <h1 className="text-6xl font-bold text-green-600">404</h1>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">Sorry, the page you are looking for does not exist or has been moved.</p>
      <Link
        to="/"
        className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;