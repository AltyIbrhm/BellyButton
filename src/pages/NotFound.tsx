import React from 'react';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-4xl font-bold mb-4 text-red-500">404</h1>
    <p className="text-lg text-gray-600">Page not found.</p>
  </div>
);

export default NotFound;
