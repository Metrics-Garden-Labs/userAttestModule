// app/projects/[projectName]/page.tsx

// import {  getProjectByName } from '../../../src/lib/db/dbprojects';
// import {getContributionsByProjectName} from '../../../src/lib/db/dbcontributions';
// import { getAttestationCountByProject } from '../../../src/lib/db/dbattestations';
// import { Contribution, ContributionWithAttestationCount, Project } from '../../../src/types';
import ProfilePage from '../profilePage';
import Navbar from '../../components/Navbar';
// import Footer from '../../components/footer';
import Sidebar from '../sidebar';
import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic'
import { ZkRegexProvider } from '@zk-email/zk-regex-sdk';
import { config } from '@/lib/contract';


interface Props {
  params?: {
    username ?: string;
  };
}

export const metadata: Metadata = {
  title: "Metrics Garden Labs - Project",
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";


const ProjectPage = async ({ params }: Props) => {
  const encodedProjectName = params?.username || '';
  const decodedProjectName = decodeURIComponent(encodedProjectName);



    return (
      <div className="flex flex-col min-h-screen bg-white text-black">

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <ZkRegexProvider clientId={GOOGLE_CLIENT_ID} zkRegexRegistryUrl='https://registry-dev.zkregex.com'>
                <ProfilePage 
                />
            </ZkRegexProvider>
          </main>
        </div>
        {/* <Footer /> */}
      </div>
      
    );
    }

export default ProjectPage;

