import React from "react";
import Image from "next/image";
import { Users } from "../../../../src/lib/utils/types";

interface UserCardProps {
  user: Users;
  onSelect: () => void;
}

function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div className="flex flex-col p-6 border justify-center items-center bg-white text-black border-gray-300 rounded-md w-full h-72 shadow-xl">
      <div className="w-36 h-36 shrink-0 rounded-full overflow-hidden mb-4 relative">
        {user.image ? (
          <Image
            src={user.image}
            alt={`${user.name}'s profile picture`}
            className="size-full object-cover"
			fill
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="flex items-center justify-center mb-2">
        <h3 className=" text-xl font-semibold text-center">{user.username}</h3>
        {user.verified && (
          <Image
            src="/githubverified.png"
            alt="Verified"
            width={24}
            height={24}
            className="inline-block ml-2 shrink-0"
            title="GitHub Verified"
          />
        )}
      </div>
      {user.bio && (
        <p className="text-sm text-gray-500 text-center overflow-hidden text-ellipsis">
          {user.bio.length > 50 ? `${user.bio.substring(0, 50)}...` : user.bio}
        </p>
      )}
      <button
        onClick={onSelect}
        className="btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
      >
        Review
      </button>
    </div>
  );
}

export default UserCard;
