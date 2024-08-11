'use client';

import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoIosArrowBack, IoIosMenu } from 'react-icons/io';
import { useSession } from 'next-auth/react';
import Sidebar from './smSidebar';
import { VerifyContent } from './verifyContent';
import { Entry, UserEndorsements } from '../../lib/utils/types';
import  useLocalStorage  from '../../hooks/useLocalStorage';
import Image from 'next/image';
import { NEXT_PUBLIC_URL } from '@/config/config';
import { format } from 'date-fns';

interface Repository {
  id: number;
  name: string;
  html_url: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('repos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [contributedRepositories, setContributedRepositories] = useState<Repository[]>([]);
  const { data: session } = useSession();
  const [githubToken] = useLocalStorage<string>('githubToken', '');
  const [githubName] = useLocalStorage<string>('githubName', '');
  const [endorsements, setEndorsements] = useState<UserEndorsements[]>([]);
  const [endorsementsLoading, setEndorsementsLoading] = useState(true);
  const [endorsementType, setEndorsementType] = useState<'given' | 'received'>('received');


  useEffect(() => {
    const fetchRepositories = async () => {
      if (githubToken && githubName && activeTab === 'repos'  ) {
        try {
          const response = await fetch(`/api/github-repos?token=${githubToken}&username=${githubName}`);
          if (!response.ok) {
            throw new Error('Failed to fetch repositories');
          }
          const { userRepos, contributedRepos } = await response.json();
          setRepositories(userRepos);
          setContributedRepositories(contributedRepos);
        } catch (error) {
          console.error('Error fetching repositories:', error);
        }
      }
    };

    fetchRepositories();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'insights') {
      fetchEndorsements();
    }
  }, [activeTab, githubName]);

  
  
  const entry: Entry = {
    id: 1,  
    slug: "zk-email/proof-of-github",
    parameters: {
        name: "GithubProof",
        values: [
            {
                name: "username",
                parts: [
                    { is_public: false, regex_def: "^Hey " },
                    { is_public: true, regex_def: "[a-zA-Z0-9-]+" }
                ],
                regex: "",
                location: "body",
                maxLength: 64,
                prefixRegex: "",
                revealStates: []
            }
        ],
        version: "v2",
        dkimSelector: "pf2023",
        senderDomain: "github.com",
        emailBodyMaxLength: 640,
        ignoreBodyHashCheck: false,
        shaPrecomputeSelector: ""
    },
    emailQuery: "[GitHub] A third-party OAuth application has been added to your account from: noreply@github.com",

    // contractAddress: "0xd8f77783b77ab4a128c98f40ba2bb44b7255c5a9",
    contractAddress: "0x14e94CA306960A0A9cC1f257a1DCfa4cc0d4B12b",
    // verifierContractAddress: "0x0f8060ac4e4a376dcf821fed126b3ac1e74b9c8e",
    verifierContractAddress: "0x60c72A58602b4eb0e4DB79dB4C3DfC19df3746E9",
    createdAt: new Date(),  // Assuming current date. Replace with actual date if available.
    updatedAt: new Date()   // Assuming current date. Replace with actual date if available.
};


  const tabClasses = (tabName: string) =>
    `cursor-pointer px-4 py-2 text-sm font-semibold mr-2 ${
      activeTab === tabName ? 'border-b-2 border-black' : 'text-gray-600 hover:text-black'
    }`;

    const subTabClasses = (tabName: string) =>
    `cursor-pointer px-4 py-2 text-sm font-semibold mr-2 ${
      endorsementType === tabName ? 'border-b-2 border-black' : 'text-gray-600 hover:text-black'
    }`;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  
  const fetchEndorsements = async () => {
    try {
      console.log('Fetching endorsements for:', githubName);
      const endpoint = endorsementType === 'received' ? 'getEndorsementForUser' : 'getEndorsementByUser';
      const response = await fetch(`${NEXT_PUBLIC_URL}/api/getEndorsementForyUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubName }),
      });

      const responseData = await response.json();
      console.log('Fetched endorsement data:', responseData);

      if (responseData && responseData.endorsements) {
        setEndorsements(responseData.endorsements);
      }
    } catch (error) {
      console.error('Error fetching endorsements:', error);
    } finally {
      setEndorsementsLoading(false);
    }
  };
  
  const renderEndorsementContent = (endorsement: UserEndorsements) => {
    return (
      <>
        <p className='text-md text-black mb-2'>{endorsement.endorserName} endorsed {endorsement.recipientname} for:</p>
        {endorsement.ecc && (
          <p className='text-sm text-gray-500 mb-2'>• Ethereum Core Contributions</p>
        )}
        {endorsement.oprd && (
          <p className='text-sm text-gray-500 mb-2'>• OP Stack Research & Development</p>
        )}
        {endorsement.optooling && (
          <p className='text-sm text-gray-500 mb-2'>• OP Stack Tooling</p>
        )}
        {!endorsement.ecc && !endorsement.oprd && !endorsement.optooling && (
          <p className='text-sm text-gray-500 mb-2'>No specific endorsements</p>
        )}
      </>
    );
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
              {repositories.map((repo) => (
                <div key={repo.id} className="p-4 border rounded-md shadow-sm bg-white">
                  <h3 className="text-lg font-semibold">{repo.name}</h3>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Repository
                  </a>
                </div>
              ))}
              {contributedRepositories.map((repo) => (
                <div key={repo.id} className="p-4 border rounded-md shadow-sm bg-white">
                  <h3 className="text-lg font-semibold">{repo.name}</h3>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Contributed Repository
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      case 'insights':
          return (
            <div className="text-black text-left">
            <h3 className="font-semibold mb-4">Insights</h3>
            <div className="flex space-x-4 mb-4">
              <button onClick={() => setEndorsementType('received')} className={subTabClasses('received')}>
                Received
              </button>
              <button onClick={() => setEndorsementType('given')} className={subTabClasses('given')}>
                Given
              </button>
            </div>
            {endorsementsLoading ? (
              <p>Loading...</p>
            ) : endorsements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-3 lg:gap-8 max-w-6xl overflow-y-auto">
                {endorsements.map((endorsement, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white border rounded-lg shadow-md"
                  >
                    <div className="flex items-start mb-2">
                      {endorsement.endorserAvatar && (
                        <Image
                          src={endorsement.endorserAvatar}
                          alt={endorsement.endorserName || ''}
                          width={40}
                          height={40}
                          className="mr-2 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">
                          {endorsement.endorserName}
                        </h3>
                        {renderEndorsementContent(endorsement)}
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(endorsement.createdAt || ''),
                            'MMMM dd, yyyy'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No endorsements yet.</p>
            )}
          </div>
        );
      case 'verify':
        return (
        <div className="text-black text-left">
            <div className="w-full overflow-y-auto">
              <VerifyContent entry={entry} />

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

          {/* <button className="" onClick={() => {}} aria-label="Go Back">
            <IoIosArrowBack className="h-6 w-6" />
          </button> */}

          <button onClick={() => setActiveTab('repos')} className={tabClasses('repos')}>
            Repositories
          </button>
          <button onClick={() => setActiveTab('insights')} className={tabClasses('insights')}>
            Insights
          </button>
          <button onClick={() => setActiveTab('verify')} className={tabClasses('verify')}>
            Verify
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
