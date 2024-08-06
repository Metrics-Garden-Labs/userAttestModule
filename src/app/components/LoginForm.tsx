// src/components/LoginForm.tsx
'use client';
import React from 'react';
import { signIn } from 'next-auth/react';

const LoginForm: React.FC = () => {
  const handleLogin = async (provider: string) => {
    await signIn(provider, { callbackUrl: '/home' });
  };

  return (
    <div>
      <button onClick={() => handleLogin('google')} className="bg-green-600 text-white p-1 rounded-mg m-1 text-lg">
        Sign In with Google
      </button>
      <button onClick={() => handleLogin('github')} className="bg-black text-white p-1 rounded-mg m-1 text-lg">
        Sign In with GitHub
      </button>
    </div>
  );
};

export default LoginForm;


