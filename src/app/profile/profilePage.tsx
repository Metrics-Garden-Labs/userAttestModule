'use client';

import React, { useState } from 'react';
import { FaSearch } from "react-icons/fa";
import { IoIosArrowBack, IoIosMenu } from "react-icons/io";
import { useSession } from 'next-auth/react';
import Sidebar from './smSidebar';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('repos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  const tabClasses = (tabName: string) =>
    `cursor-pointer px-4 py-2 text-sm font-semibold mr-2 ${
      activeTab === tabName ? 'border-b-2 border-black' : 'text-gray-600 hover:text-black'
    }`;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'repos':
        return (
          <div className="px-3 bg-backgroundgray">
            <div className="mb-4 flex justify-between items-center flex-col sm:flex-row">
              <div className="relative w-full sm:w-1/2 mb-2 sm:mb-0">
                <input
                  type="text"
                  placeholder="Search for a repository..."
                  className="px-4 py-2 border border-gray-300 rounded-md w-full text-sm"
                />
                <span className="absolute right-3 top-3 text-black">
                  <FaSearch />
                </span>
              </div>
              <select className="px-4 py-2 bg-backgroundgray text-black rounded-full w-full sm:w-60 border-none focus:ring-0 focus:border-none text-sm">
                <option>Sort by: Most Stars</option>
              </select>
            </div>
            <div className="mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-3 lg:gap-8 max-w-6xl overflow-y-auto">
              {/* Repository cards go here */}
            </div>
          </div>
        );
      case 'contributions':
        return (
          <div className="px-3 bg-backgroundgray">
            <div className="mb-4 flex justify-between items-center flex-col sm:flex-row">
              <div className="relative w-full sm:w-1/2 mb-2 sm:mb-0">
                <input
                  type="text"
                  placeholder="Search for a contribution..."
                  className="px-4 py-2 border border-gray-300 rounded-md w-full text-sm"
                />
                <span className="absolute right-3 top-3 text-black">
                  <FaSearch />
                </span>
              </div>
            </div>
            <div className="mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-3 lg:gap-8 max-w-6xl overflow-y-auto">
              {/* Contribution cards go here */}
            </div>
          </div>
        );
      case 'insights':
        return (
          <div className="text-black text-left">
            <h3 className="font-semibold mb-4">Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-3 lg:gap-8 max-w-6xl overflow-y-auto">
              {/* Insights cards go here */}
              <h1>Insights</h1>
            </div>
          </div>
        );
      default:
        return <div className="text-black">Select a tab</div>;
    }
  };

  return (
    <main className="flex-grow relative p-8 sm:p-10 bg-backgroundgray w-full h-full">
      <div className="mb-4 border-b border-gray-200 mt-4 sm:mt-8">
        <nav className="flex space-x-4 text-black">
          <button className="lg:hidden" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <IoIosMenu className="h-6 w-6" />
          </button>

          <button className="" onClick={() => {}} aria-label="Go Back">
            <IoIosArrowBack className="h-6 w-6" />
          </button>

          <button onClick={() => setActiveTab('repos')} className={tabClasses('repos')}>
            Repositories
          </button>
          <button onClick={() => setActiveTab('contributions')} className={tabClasses('contributions')}>
            Contributions
          </button>
          <button onClick={() => setActiveTab('insights')} className={tabClasses('insights')}>
            Insights
          </button>
        </nav>
      </div>

      <div className="flex">
        <div
          className={`fixed inset-0 z-10 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden ${
            sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleSidebar}
        ></div>
        <div
          className={`fixed inset-y-0 left-0 z-40 bg-white transform transition-transform duration-300 ease-in-out w-70 md:w-70 lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </div>

        <div className="flex-1 p-4">{renderContent()}</div>
      </div>
    </main>
  );
}
