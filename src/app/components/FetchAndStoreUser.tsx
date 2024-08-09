'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const FetchAndStoreUser: React.FC = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const storeUser = async () => {
      if (status === 'authenticated' && session?.accessToken) {
        try {
          // Call the API route to store user data
          const response = await fetch('/api/addUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken: session.accessToken,
              email: session.user?.email,
              name: session.user?.name,
              image: session.user?.image,
            }),
          });

          console.log('request body: ', session.user);

          if (!response.ok) {
            throw new Error('Failed to store user in the database');
          }

          console.log('User data stored in the database');

        } catch (error) {
          console.error('Error storing user data:', error);
        }
      }
    };

    storeUser();
  }, [session, status]);

  return null; // This component doesn't render anything
};

export default FetchAndStoreUser;
