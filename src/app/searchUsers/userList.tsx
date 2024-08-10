'use client';

import React, { useEffect, useMemo, useState } from 'react';
import UserCard from '../components/ui/UserCard';
import UserModal from '../components/ui/UserModal';
import { Users } from '../../lib/utils/types';
import { useSwitchChain } from 'wagmi';


interface UserListProps {
  users: Users[];
  query: string;
  filter: string;
  verificationFilter: string;
}

export default function UserList({ users, query, filter, verificationFilter }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    switchChain({ chainId: 11155420});
    console.log("Switched to chain 11155420");
   }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery = user.username.toLowerCase().includes(query.toLowerCase());
      // Note: Adjust this filtering logic based on your actual verification criteria
      const matchesVerification = verificationFilter === '';
      return matchesQuery && matchesVerification;
    });
  }, [users, query, verificationFilter]);

  const handleUserClick = (user: Users) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="p-6 bg-white mx-auto gap-12 max-w-6xl">
      <div className="grid grid-cols-1 gap-4 mx-3 sm:grid-cols-2 sm:gap-4 sm:mx-3 md:grid-cols-3 md:mx-8 lg:grid-cols-4 lg:gap-12 max-w-6xl overflow-y-auto">
        {filteredUsers.map((user) => (
          <div key={user.id} onClick={() => handleUserClick(user)}>
            <UserCard user={user} />
          </div>
        ))}
      </div>
      {selectedUser && (
        <UserModal user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  );
}