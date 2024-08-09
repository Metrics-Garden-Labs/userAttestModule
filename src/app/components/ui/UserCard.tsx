import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Users } from "../../../../src/lib/utils/types";

interface UserCardProps {
    user: Users;
  }
  
  function UserCard({ user }: UserCardProps) {
    return (
      <Link href={`/users/${encodeURIComponent(user.githubId)}`}>
        <div className="flex flex-col p-6 border justify-center items-center bg-white text-black border-gray-300 rounded-2xl w-full h-60 shadow-lg">
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
          <h3 className="mb-2 text-xl font-semibold text-center">
            {user.name}
          </h3>
          {user.bio && (
            <p className="text-sm text-gray-500 text-center overflow-hidden text-ellipsis">
              {user.bio.length > 50 ? `${user.bio.substring(0, 50)}...` : user.bio}
            </p>
          )}
        </div>
      </Link>
    );
  }

export default UserCard;