import React from 'react';
import Image from 'next/image';
import { Users } from '../../../lib/utils/types';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

interface UserModalProps {
  user: Users;
  onClose: () => void;
}

export default function UserModal({ user, onClose }: UserModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl max-w-md w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-2xl">&times;</button>
        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 relative">
            {user.avatarUrl ? (
              <Image 
                src={user.avatarUrl} 
                alt={`${user.name}'s profile picture`}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                No Avatar
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
          <p className="text-gray-600 mb-4">@{user.username}</p>
          {user.bio && <p className="text-center mb-4">{user.bio}</p>}
          <div className="w-full flex flex-col items-center">
            {user.company && (
              <p className="mb-2"><strong>Company:</strong> {user.company}</p>
            )}
            {user.email && (
              <p className="mb-2"><strong>Email:</strong> {user.email}</p>
            )}
            {user.twitter && (
              <p className="mb-2"><strong>Twitter:</strong> @{user.twitter}</p>
            )}
            <Link href={user.url || ""} className="mb-4">
              <FaGithub size={24} />
            </Link>
            <button className='btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg'>
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}