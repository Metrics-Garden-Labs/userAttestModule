import React from 'react';
import Link from 'next/link';

interface AttestationConfirmationModalProps {
  attestationUID: string;
  onClose: () => void;
}

const AttestationConfirmationModal: React.FC<AttestationConfirmationModalProps> = ({
  attestationUID,
  onClose,
}) => {
  const attestationLink = `https://optimism-sepolia.easscan.org/attestation/view/${attestationUID}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md sm:w-4/5 sm:max-w-lg md:w-1/2 lg:w-1/3">
        <h2 className="text-xl font-bold mb-4 text-center">Attestation Created</h2>
        <p className="text-center">Your attestation has been successfully created.</p>
        <Link href={attestationLink} target="_blank" rel="noopener noreferrer">
          <p className='text-[#E67529] hover:text-black underline hover:underline text-center overflow-y-auto'>View Attestation</p>
        </Link>
        <div className="flex justify-center mt-4">
          <button
            className="btn bg-headerblack text-white hover:bg-black"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttestationConfirmationModal;