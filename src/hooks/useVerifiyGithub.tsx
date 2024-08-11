import { useState } from 'react';
import { SchemaEncoder, EAS, NO_EXPIRATION, ZERO_BYTES32, AttestationRequestData } from '@ethereum-attestation-service/eas-sdk';
import { useSigner } from './useEAS';
import { NEXT_PUBLIC_URL } from '../config/config';
import useLocalStorage from './useLocalStorage';

export const useCreatGithubAttestation = () => {
  const [attestationUID, setAttestationUID] = useState<string>('');
  const signer = useSigner();
  const [githubName] = useLocalStorage<string>('githubName', '');

  const createGithubAttestation = async (hash : string) => {
    if (!signer) {
      console.error('Signer not available');
      return null;
    }
    console.log('Creating attestation for:', hash);

    const schema = '0x99d9df6c8a76093483636d049f04f0a0137e383d50f03d54f18f9d426b7c9497';
    const schemaEncoder = new SchemaEncoder(
      'bool VerifiedGithub,bytes32 txHash'
    )
    const encodedData = schemaEncoder.encodeData([
      { name: 'VerifiedGithub', value: true, type: 'bool' },
      { name: 'txHash', value: hash, type: 'bytes32' },
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
        await addVerifiedStatusToDatabase(hash, newAttestationUID, githubName);
        
        return newAttestationUID;
      } else {
        throw new Error(`Failed to create attestation, Error: ${responseData.error}`);
      }
    } catch (error) {
      console.error('Error creating attestation:', error);
      return null;
    }
  };

  const addVerifiedStatusToDatabase = async (
    hash : string,
    attestationUID: string,
    githubName: string
  ) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_URL}/api/addVerifiedStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash,
          attestationUID,
          githubName
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

  return { createGithubAttestation, attestationUID };
};