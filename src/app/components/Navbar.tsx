'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';
import { isMobile } from 'react-device-detect';
import { signIn, signOut, useSession } from 'next-auth/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import FetchAndStoreUser from './FetchAndStoreUser';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
    <FetchAndStoreUser />

      <div className="flex justify-between items-center navbar bg-headerblack text-neutral-content p-3 md:p-8">
        <Link href="/">
          <p
            className={`btn bg-headerblack text-xl border-none ${
              isMobile ? 'pl-2' : 'pl-10'
            }`}
          >
            <Image src="/mglwhite.png" alt="MGL Logo" width={40} height={40} className="h-10 w-10" />
          </p>
        </Link>
        <div className="hidden md:flex justify-end items-center lg:gap-x-8 md:gap-x-2">
          <Link href="/searchUsers">
            <p className="text-white text-md md:text-sm hover:text-opacity-75">SEARCH USERS</p>
          </Link>
          {status === 'authenticated' && (
            <Link href={`/profile/${session?.user?.githubName || session?.user?.name}`}>
              <p className="text-white lg:text-md md:text-sm hover:text-opacity-75">PROFILE</p>
            </Link>
          )}
        </div>
        <div className="flex items-center relative">
          {status === 'authenticated' ? (
            <div className="flex items-center space-x-2">
              <ConnectButton 
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
              />
              <Image
                src={session?.user?.githubImage || session?.user?.image || ""}
                alt={session?.user?.githubName || session?.user?.name || ""}
                width={40}
                height={40}
                className="rounded-full cursor-pointer"
                onClick={toggleDropdown}
              />
              <p className="text-white cursor-pointer" onClick={toggleDropdown}>
                {session?.user?.githubName || session?.user?.name || ""}
              </p>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <button
                    onClick={() => signOut()}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn('github')}
              className="bg-black text-white px-2 py-1 rounded-md"
            >
              Sign in with GitHub
            </button>
          )}
          <div className="md:hidden ml-4">
            <button className="text-white focus:outline-none" onClick={toggleSidebar}>
              {isSidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black opacity-50 z-40" onClick={closeSidebar}></div>
      )}
      <div
        className={`fixed top-0 right-0 h-screen w-64 bg-headerblack text-white p-4 transition-transform duration-300 ease-in-out transform z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end">
          <button className="text-white focus:outline-none" onClick={toggleSidebar}>
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <ul className="space-y-4 mt-8">
          <li>
            <Link href="/searchUsers">
              <p className="block py-2" onClick={closeSidebar}>SEARCH USERS</p>
            </Link>
          </li>
          <li>
            <Link href={`/profile/${session?.user?.githubName || session?.user?.name}`}>
              <p className="block py-2" onClick={closeSidebar}>PROFILE</p>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}