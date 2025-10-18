import React from 'react';

const TestPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
    <h1 className="text-4xl font-bold text-[color:var(--sibol-green)] mb-4">Tailwind CSS Test</h1>
    <p className="text-lg text-gray-700">If you see this styled, Tailwind is working!</p>
    <button className="mt-6 px-4 py-2 bg-[color:var(--sibol-green)] text-white rounded hover:bg-green-800 transition">
      Test Button
    </button>
  </div>
);

export default TestPage;