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
  name: string;
  email: string;
  avatarUrl: string;
  bio: string | null;
  url: string | null;
  createdAt: Date;
}
