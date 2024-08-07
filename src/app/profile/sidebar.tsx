

//thinking about making this a server component that gets the attestation count when you visit and
//doenst update until you refresh the page when you make a contribution.
//otherwise its too much hassle to make it a client component and have it update in real time.
//TODO: make this a server component
'use client';
import { Fragment, SetStateAction, useState, Dispatch, useEffect } from 'react';
import { LuArrowUpRight } from "react-icons/lu";
// import { Project } from '../../src/types';
import Image from 'next/image';
// import { NEXT_PUBLIC_URL } from '@/src/config/config';
// import {useGlobalState} from '@/src/config/config';
import Link from 'next/link';
import { BsGlobe2 } from 'react-icons/bs';
import { FaGithub} from 'react-icons/fa6';
import { useSession } from 'next-auth/react';
// import { getAttestationCountByProject } from '@/src/lib/db/dbattestations';

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}




const Sidebar = ()=> {
  const { data: session, status } = useSession();


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
          {/* Sidebar content */}
          <div className="py-10 px-8 flex grow flex-col gap-y-5 bg-white overflow-y-auto px-6 pb-4">
            <div className="h-60 bg-gray-300 rounded-full flex justify-center items-center">
              {/* Replace src with your image path */}
              {session? (
                    <Image
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || ""}
                      width={144}
                      height={144}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="mx-auto w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    </div>
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
              <div className="text-sm font-medium text-gray-500">Created  <span>ago</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;