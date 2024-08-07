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
