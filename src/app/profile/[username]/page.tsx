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

interface Props {
  params?: {
    username ?: string;
  };
}

export const metadata: Metadata = {
  title: "Metrics Garden Labs - Project",
};

const ProjectPage = async ({ params }: Props) => {
  const encodedProjectName = params?.username || '';
  const decodedProjectName = decodeURIComponent(encodedProjectName);



    return (
      <div className="flex flex-col min-h-screen bg-white text-black">

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <ProfilePage 
              />
          </main>
        </div>
        {/* <Footer /> */}
      </div>
      
    );
    }

export default ProjectPage;


