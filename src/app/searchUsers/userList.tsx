import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UserCard from '../components/ui/UserCard';

export interface Users {
  id: number;
  githubId: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string | null;
  url: string | null;
  createdAt: Date;
}

interface UserListProps {
  users: Users[];
  query: string;
  filter: string;
  verificationFilter: string;
}

export default function UserList({ users, query, filter, verificationFilter }: UserListProps) {
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery = user.name.toLowerCase().includes(query.toLowerCase());
      // Note: Adjust this filtering logic based on your actual verification criteria
      const matchesVerification = verificationFilter === '';
      return matchesQuery && matchesVerification;
    });
  }, [users, query, verificationFilter]);

  return (
    <div className="p-6 bg-white mx-auto gap-12 max-w-6xl">
      <div className="grid grid-cols-1 gap-4 mx-3 sm:grid-cols-2 sm:gap-4 sm:mx-3 md:grid-cols-3 md:mx-8 lg:grid-cols-4 lg:gap-12 max-w-6xl overflow-y-auto">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
