'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa6';
import useLocalStorage from '@/hooks/useLocalStorage';

const Sidebar = () => {
  const { data: session, status } = useSession();
  const [githubName, setGithubName] = useLocalStorage<string>('githubName', '');
  const [githubImage, setGithubImage] = useLocalStorage<string>('githubImage', '');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (session?.user?.name && session.provider === 'github') {
      setGithubName(session.user.name);
    }
    if (session?.user?.image && session.provider === 'github') {
      setGithubImage(session.user.image);
    }
  }, [session, setGithubName, setGithubImage]);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (githubName) {
        try {
          const response = await fetch('/api/getVerificationStatus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ githubName }),
          });
          const data = await response.json();
          setIsVerified(data.verified);
        } catch (error) {
          console.error('Error checking verification status:', error);
        }
      }
    };

    checkVerificationStatus();
  }, [githubName]);

  return (
    <div className='lg:w-72 bg-white h-screen pt-16 pb-8'>
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
              <div className="mx-auto w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"></div>
            )}
          </div>
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900 mr-2">{githubName || 'Anonymous'}</h2>
            {isVerified && (
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
            <div className="text-sm font-medium text-gray-500">Attestations: </div>
            <div className="text-sm font-medium text-gray-500">Created <span>ago</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;