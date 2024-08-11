
import React from 'react';
import LoginForm from './components/LoginForm';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center">
      <header className="mb-8">
        <h1 className="text-5xl font-bold text-gray-800">User Attestation Module</h1>
        <h2 className="text-2xl text-gray-600 mt-2">of Metrics Garden Labs</h2>
      </header>
      <p className="text-lg text-gray-700 max-w-md leading-relaxed">
        Welcome to Metrics Garden Labs. We're working on something amazing! Stay tuned for more updates.
      </p>
    </div>
  );
};

export default Home;

