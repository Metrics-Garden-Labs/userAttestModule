'use client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { BsGlobe2 } from 'react-icons/bs';
import { FaGithub } from 'react-icons/fa6';

const Sidebar = () => {
  const { data: session, status } = useSession();

  return (
    <div className='lg:w-72 bg-white h-screen pt-16 pb-8'>
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Sidebar content */}
        <div className="py-10 px-8 flex grow flex-col gap-y-5 bg-white overflow-y-auto px-6 pb-4">
          <div className="h-60 bg-gray-300 rounded-full flex justify-center items-center">
            {session ? (
              <Image
                src={session?.user?.image || ""}
                alt={session?.user?.name || ""}
                width={144}
                height={144}
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div className="mx-auto w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"></div>
            )}
          </div>
          {/* User Name */}
          <h2 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h2>
          <div className="">
            <Link href={`https://github.com/${session?.user?.name}` || '#'}>
              <p className='flex items-center '>
                <FaGithub className="text-black mx-2 text-lg" />
                <span>Github</span>
              </p>
            </Link>
          </div>
          {/* Stats and Categories */}
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
