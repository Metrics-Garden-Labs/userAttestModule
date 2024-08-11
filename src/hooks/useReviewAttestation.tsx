import { useState } from 'react';
import { SchemaEncoder, EAS, NO_EXPIRATION, ZERO_BYTES32, AttestationRequestData } from '@ethereum-attestation-service/eas-sdk';
import { useSigner } from './useEAS';
import { NEXT_PUBLIC_URL } from '../config/config';
import useLocalStorage from './useLocalStorage';

export const useCreateReviewAttestation = () => {
  const [attestationUID, setAttestationUID] = useState<string>('');
  const signer = useSigner();
  const [githubName] = useLocalStorage<string>('githubName', '');

  const createReviewAttestation = async (username: string, endorsements: {
    ethereumCore: boolean,
    opStackResearch: boolean,
    opStackTooling: boolean
  }) => {
    if (!signer) {
      console.error('Signer not available');
      return null;
    }
    console.log('Creating attestation for:', username, endorsements);

    const schema = '0x4317a4591cbcb785778e6d77b3cb7d5baa789ed5481d4bb4eeaf94a785556f7c';
    const schemaEncoder = new SchemaEncoder(
      'string githubuserfrom, string githubuserto, bool endorsedECC, bool endorsedOPRD, bool endorsedOPTooling'
    )
    const encodedData = schemaEncoder.encodeData([
      { name: 'githubuserfrom', value: githubName, type: 'string' },
      { name: 'githubuserto', value: username, type: 'string' },
      { name: 'endorsedECC', value: endorsements.ethereumCore, type: 'bool' },
      { name: 'endorsedOPRD', value: endorsements.opStackResearch, type: 'bool' },
      { name: 'endorsedOPTooling', value: endorsements.opStackTooling, type: 'bool' },
    ]);

    const easop = new EAS('0x4200000000000000000000000000000000000021');
    easop.connect(signer);
    console.log('recipient', await signer.getAddress());

    const attestationdata: AttestationRequestData = {
      recipient: await signer.getAddress(),
      expirationTime: NO_EXPIRATION,
      revocable: true,
      refUID: ZERO_BYTES32,
      data: encodedData,
      value: BigInt(0),
    };

    console.log('Attestation Data:', attestationdata);

    const dataToSend = {
      schema: schema,
      ...attestationdata,
    };

    const serialisedData = JSON.stringify(dataToSend, (key, value) =>
      typeof value === 'bigint' ? '0x' + value.toString(16) : value
    );

    try {
      const response = await fetch(`${NEXT_PUBLIC_URL}/api/projectAttestation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: serialisedData,
      });
      const responseData = await response.json();

      if (responseData.success) {
        const newAttestationUID = responseData.attestationUID;
        setAttestationUID(newAttestationUID);
        
        // Add the recommendation to the database
        await addRecommendationToDatabase(githubName, username, endorsements, newAttestationUID);
        
        return newAttestationUID;
      } else {
        throw new Error(`Failed to create attestation, Error: ${responseData.error}`);
      }
    } catch (error) {
      console.error('Error creating attestation:', error);
      return null;
    }
  };

  const addRecommendationToDatabase = async (
    endorserName: string,
    recipientName: string,
    endorsements: {
      ethereumCore: boolean,
      opStackResearch: boolean,
      opStackTooling: boolean
    },
    attestationUID: string
  ) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_URL}/api/addRecommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endorserName,
          recipientName,
          endorsements,
          attestationUID,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add recommendation to database');
      }

      const data = await response.json();
      console.log('Recommendation added to database:', data);
    } catch (error) {
      console.error('Error adding recommendation to database:', error);
    }
  };

  return { createReviewAttestation, attestationUID };
};