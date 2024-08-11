'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa6';
import { useSession } from 'next-auth/react';
import useLocalStorage from '@/hooks/useLocalStorage';

const Sidebar = () => {
  const { data: session, status } = useSession();
  const [githubName, setGithubName] = useLocalStorage<string>('githubName', '');
  const [githubImage, setGithubImage] = useLocalStorage<string>('githubImage', '');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.name && session.provider === 'github') {
      setGithubName(session.user.name);
    }
    if (session?.user?.image && session.provider === 'github') {
      setGithubImage(session.user.image);
    }
  }, [session, setGithubName, setGithubImage]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (githubName) {
        try {
          const response = await fetch('/api/getEndorsementCount', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ githubName }),
          });
          const data = await response.json();
          setUserData(data.userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [githubName]);

  const getProjectDuration = (createdAt: string | null) => {
    if (!createdAt) return 'Unknown';

    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  return (
    <>
      <div className='hidden lg:block lg:w-72 bg-white h-screen pt-16 pb-8'>
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="py-10 px-8 flex grow flex-col gap-y-5 bg-white overflow-y-auto px-6 pb-4">
            <div className="h-60 bg-gray-300 rounded-full flex justify-center items-center">
              {session ? (
                <Image
                  src={githubImage || '/default-avatar.png'}
                  alt={githubName || 'User avatar'}
                  width={144}
                  height={144}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <div className="mx-auto w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                </div>
              )}
            </div>
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900 mr-2">{githubName || 'Anonymous'}</h2>
              {userData?.verified && (
                <Image
                  src="/githubverified.png"
                  alt="Verified"
                  width={24}
                  height={24}
                  className="inline-block"
                />
              )}
            </div>
            <div className="">
              <Link href={`https://github.com/${githubName}` || '#'}>
                <p className='flex items-center '>
                  <FaGithub className="text-black mx-2 text-lg" />
                  <span>Github</span>
                </p>
              </Link>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">
                Attestations: {userData?.endorsementCount || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;