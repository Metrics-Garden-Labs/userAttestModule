"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users } from "../../../lib/utils/types";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { useCreateReviewAttestation } from "../../../hooks/useReviewAttestation";
import AttestationCreationModal from "./AttestationCreationModal";
import AttestationConfirmationModal from "./AttestationConfirmationModal";

interface UserModalProps {
  user: Users;
  onClose: () => void;
}

export default function UserModal({ user, onClose }: UserModalProps) {
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentAttestationUID, setCurrentAttestationUID] = useState<
    string | null
  >(null);
  const [endorsements, setEndorsements] = useState({
    ethereumCore: false,
    opStackResearch: false,
    opStackTooling: false,
  });
  const { createReviewAttestation } = useCreateReviewAttestation();

  const toggleEndorsement = (key: keyof typeof endorsements) => {
    setEndorsements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitEndorsements = async () => {
    console.log("Endorsements:", endorsements);
    setLoading(true);
    const uid = await createReviewAttestation(user.username, endorsements);
    setLoading(false);
    if (uid) {
      console.log("Attestation created with UID:", uid);
      setCurrentAttestationUID(uid);
      setShowConfirmation(true);
    } else {
      console.error("Failed to create attestation");
      // Optionally, show an error message to the user
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setCurrentAttestationUID(null);
    onClose(); // Close the entire modal after confirmation
  };

  const renderModal = () => {
    if (loading) {
      return <AttestationCreationModal />;
    } else if (showConfirmation && currentAttestationUID) {
      return (
        <AttestationConfirmationModal
          attestationUID={currentAttestationUID}
          onClose={handleCloseConfirmation}
        />
      );
    }
    return null;
  };

  const renderInfoScreen = () => (
    <div className="flex flex-col items-center text-center">
      <div className="w-32 h-32 rounded-full overflow-hidden mb-4 relative">
        {user.image ? (
          <Image
            src={user.image}
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
      <div className="flex items-center justify-center mb-2">
        <h2 className=" text-xl font-semibold text-center">{user.name}</h2>
        {user.verified && (
          <Image
            src="/githubverified.png"
            alt="Verified"
            width={24}
            height={24}
            className="inline-block ml-2"
            title="GitHub Verified"
          />
        )}
      </div>
      <p className="text-gray-600 mb-4">@{user.username}</p>
      {user.bio && <p className="text-center mb-4">{user.bio}</p>}
      <div className="w-full flex flex-col items-center">
        {user.company && (
          <p className="mb-2">
            <strong>Company:</strong> {user.company}
          </p>
        )}
        {user.email && (
          <p className="mb-2">
            <strong>Email:</strong> {user.email}
          </p>
        )}
        {user.twitter && (
          <p className="mb-2">
            <strong>Twitter:</strong> @{user.twitter}
          </p>
        )}
        <Link href={user.url || ""} className=" bg-[#E67529] text-black mb-4">
          <FaGithub size={24} />
        </Link>
      </div>
    </div>
  );

  const renderReviewScreen = () => (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold mb-4">
        Endorse {user.name}’s Knowledge
      </h2>
      <p className="mb-6">
        For which of these topics would you endorse this user’s knowledge?
        Select all that apply:
      </p>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {Object.entries(endorsements).map(([key, value]) => (
          <button
            key={key}
            onClick={() => toggleEndorsement(key as keyof typeof endorsements)}
            className={`mb-2 px-4 py-2 rounded-lg text-sm ${
              value ? "bg-[#E67529] text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {key === "ethereumCore" && "Ethereum Core Contributions"}
            {key === "opStackResearch" && "OP Stack Research & Development"}
            {key === "opStackTooling" && "OP Stack Tooling"}
          </button>
        ))}
      </div>
      <button
        onClick={handleSubmitEndorsements}
        className="btn bg-headerblack text-white hover:bg-black"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Endorsements"}
      </button>
    </div>
  );

  const isProfileInfo = !isReviewMode;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl max-w-md w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-2xl">
          &times;
        </button>

        <h2 className="text-xl text-center font-bold mb-4">{user.username}</h2>

        <div className="flex justify-center w-full space-x-4 mb-4">
          <button
            className={`font-semibold w-full border-b-2 pb-2 ${
              isProfileInfo
                ? "text-black border-black"
                : "text-gray-500 border-black/30"
            }`}
            onClick={() => setIsReviewMode(false)}
          >
            User Info
          </button>
          <button
            className={`font-semibold w-full border-b-2 pb-2 ${
              isReviewMode
                ? "text-black  border-black"
                : "text-gray-500 border-black/30"
            }`}
            onClick={() => setIsReviewMode(true)}
          >
            Rate
          </button>
        </div>
        {isReviewMode ? renderReviewScreen() : renderInfoScreen()}
        {renderModal()}
      </div>
    </div>
  );
}
