'use client';
import { useEffect } from 'react';
import { LuArrowUpRight } from "react-icons/lu";
import Image from 'next/image';
import Link from 'next/link';
import { BsGlobe2 } from 'react-icons/bs';
import { FaGithub } from 'react-icons/fa6';
import { useSession } from 'next-auth/react';
import useLocalStorage from '@/hooks/useLocalStorage';

function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = () => {
  const { data: session, status } = useSession();
  const [githubName, setGithubName] = useLocalStorage<string>('githubName', '');
  const [githubImage, setGithubImage] = useLocalStorage<string>('githubImage', '');

  useEffect(() => {
    if (session?.user?.name && session.provider === 'github') {
      setGithubName(session.user.name);
    }
    if (session?.user?.image && session.provider === 'github') {
      setGithubImage(session.user.image);
    }
  }, [session, setGithubName, setGithubImage]);

  const getProjectDuration = (createdAt: Date | null | undefined) => {
    if (!createdAt) return 'Unknown';

    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const diffInMonths = (currentDate.getFullYear() - createdDate.getFullYear()) * 12 +
      (currentDate.getMonth() - createdDate.getMonth());

    return `${diffInMonths} months`;
  };

  return (
    <>
      <div className='hidden lg:block lg:w-72 bg-white h-screen pt-16 pb-8'>
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="py-10 px-8 flex grow flex-col gap-y-5 bg-white overflow-y-auto px-6 pb-4">
            <div className="h-60 bg-gray-300 rounded-full flex justify-center items-center">
              {session ? (
                <Image
                  src={githubImage || '/default-avatar.png'} // Provide a default image
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
            <h2 className="text-2xl font-bold text-gray-900">{githubName || 'Anonymous'}</h2>
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
    </>
  );
}

export default Sidebar;