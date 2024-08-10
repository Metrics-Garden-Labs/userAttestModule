'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Users } from '../../../lib/utils/types';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { useCreateReviewAttestation } from '../../../hooks/useReviewAttestation';
import AttestationCreationModal from './AttestationCreationModal';
import AttestationConfirmationModal from './AttestationConfirmationModal';

interface UserModalProps {
  user: Users;
  onClose: () => void;
}

export default function UserModal({ user, onClose }: UserModalProps) {
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [loading , setLoading] = useState(false);
  const [endorsements, setEndorsements] = useState({
    ethereumCore: false,
    opStackResearch: false,
    opStackTooling: false,
  });
  const { createReviewAttestation, attestationUID } = useCreateReviewAttestation();

  const toggleEndorsement = (key: keyof typeof endorsements) => {
    setEndorsements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReviewClick = () => {
    console.log("Review button clicked");
    setIsReviewMode(true);
  };

  const handleSubmitEndorsements = async () => {
    console.log('Endorsements:', endorsements);
    setLoading(true);
    const uid = await createReviewAttestation(user.username, endorsements);
    if (uid) {
      console.log('Attestation created with UID:', uid);
      setLoading(false);
      onClose();
    } else {
      console.error('Failed to create attestation');
    }
  };

  const renderModal = () => {
    if (loading) {
      return <AttestationCreationModal />;
    } else if (attestationUID) {
      return (
        <AttestationConfirmationModal
          attestationUID={attestationUID}
          onClose={onClose}
        />
      );
    }
    return null;
  };

  const renderInfoScreen = () => (
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
        <button 
          onClick={handleReviewClick} 
          className='btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg'
        >
          Review
        </button>
      </div>
    </div>
  );

  const renderReviewScreen = () => (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold mb-4">Endorse {user.name}'s Knowledge</h2>
      <p className="mb-6">For which of these topics would you endorse this user's knowledge? Select all that apply:</p>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {Object.entries(endorsements).map(([key, value]) => (
          <button
            key={key}
            onClick={() => toggleEndorsement(key as keyof typeof endorsements)}
            className={`mb-2 px-4 py-2 rounded-lg text-sm ${
              value ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {key === 'ethereumCore' && 'Ethereum Core Contributions'}
            {key === 'opStackResearch' && 'OP Stack Research & Development'}
            {key === 'opStackTooling' && 'OP Stack Tooling'}
          </button>
        ))}
      </div>
      <button 
        onClick={handleSubmitEndorsements}  // Changed this line
        className='btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg'
      >
        Submit Endorsements
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl max-w-md w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-2xl">&times;</button>
        {isReviewMode ? renderReviewScreen() : renderInfoScreen()}
        {renderModal()}
      </div>
    </div>
  );
}