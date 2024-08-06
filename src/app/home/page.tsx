// src/app/page.tsx (or src/pages/index.tsx if not using app directory)
'use client';

import { useSession } from 'next-auth/react';
import Logout from '../components/Logout';
import Image from 'next/image';

const HomePage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return (
    <div className="flex flex-col items-center m-4">
      <h1 className="text-3xl my-2">{session.user?.name}</h1>
      {session.user?.image && (
        <Image
          src={session.user.image}
          alt={session.user.name || ""}
          width={72}
          height={72}
          className="rounded-full"
        />
      )}
      <Logout />
    </div>
  );
};

export default HomePage;


