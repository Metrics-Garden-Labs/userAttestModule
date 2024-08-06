
import React from 'react';
import { signOut } from 'next-auth/react';

const Logout: React.FC = () => {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <button onClick={handleLogout} className="bg-blue-400 my-2 text-white p-1 rounded">
      Logout
    </button>
  );
};

export default Logout;

