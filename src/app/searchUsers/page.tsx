//this page is going to let you look at the people who attest, what they have attested to, feedback and such 

//see if they are coinbase verified, and if they have a profile
//can search with farcaster username that we store etc, 

//see if they are optimism badge holders etc.  that is the task at hand. 

// userProfile.tsx

import React from "react";
import SearchUsers from "./searchUsers";
import UserList from "./userList";
import { Users } from '../../../src/lib/utils/types';
import { getUsers } from '../../drizzle/db';
import { Metadata } from "next";


interface Props {
  searchParams?: {
    query?: string;
    filter?: string;
    verificationFilter?: string; 
  };
}

export const metadata: Metadata = {
  title: "Metrics Garden Labs - Search Users",
};

const UserProfilePage = async ({ searchParams }: Props) => {
  const query = searchParams?.query || '';
  const filter = searchParams?.filter || '';
  const verificationFilter = searchParams?.verificationFilter || '';


  try {
    const users: Users[] = await getUsers();

    return (
      <div className="bg-white text-black">

        <SearchUsers />
        <UserList users={users} query={query} filter={filter} verificationFilter={verificationFilter} />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch users:', error);
    // Handle the error, display an error message, or return a fallback UI
    return (
      <div className="bg-white text-black">
        <h1>Search Users Here:</h1>
        <SearchUsers />
        <p>Failed to fetch users. Please try again later.</p>
      </div>
    );
  }
};

export default UserProfilePage;