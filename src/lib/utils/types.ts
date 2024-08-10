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

export interface UserEndorsements {
  id: number;
  recipientId: number;
  recipientname: string;
  endorserId: number;
  endorserName: string;
  endorserAvatar: string | null;
  endorsername: string;
  ecc: boolean | null;
  oprd: boolean | null;
  optooling: boolean | null;
  attestationuid: string;
  createdAt: Date;
}
