export interface Entry {
  id: number;
  slug: string;
  parameters: any;
  emailQuery: string;
  contractAddress: string;
  verifierContractAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Users {
  id: number;
  githubId: string;
  username: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  url: string | null;
  company: string | null;
  twitter: string | null;
  orgs: unknown;
  createdAt: Date;
}
