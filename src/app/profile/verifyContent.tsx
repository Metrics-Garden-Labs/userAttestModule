import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect, FormEvent } from 'react';
import { fetchEmailList, fetchEmailsRaw, useZkRegex } from '@zk-email/zk-regex-sdk';
import PostalMime from 'postal-mime';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { BaseError, Hex } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';
import { circuitOutputToArgs, parseOutput } from '@/lib/contract';
import { calculateSignalLength } from '@/lib/code-gen/utils';
import { Entry } from '@/lib/utils/types';
import { Check, X } from 'lucide-react';
import { SimpleDialog } from '../components/ui/SimpleDialog';

export interface ContentProps {
  entry: Entry;
}

// type RawEmailResponse = {
//   subject: string;
//   internalDate: string;
//   decodedContents: string;
// };

// type Email2 = {
//     subject: string;
//     internalDate: string;
//     selected: boolean;
//     inputs?: any;
//     error?: string;
//   };
  

// type Email = RawEmailResponse & { selected: boolean, inputs?: any, error?: string, body?: string };

type RawEmailResponse = {
    subject: string;
    internalDate: string;
    decodedContents: string;
  };
  
  type Email = RawEmailResponse & { 
    selected: boolean, 
    inputs?: any, 
    error?: string, 
    body?: string 
  };
export function VerifyContent(props: ContentProps) {
  const workers = new Map<string, boolean>();
  const entry = props.entry;
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [renderTrigger, setRenderTrigger] = useState(0)
  const { data: session } = useSession();
  const {
    createInputWorker,
    generateInputFromEmail,
    generateProofRemotely,
    proofStatus,
    inputWorkers,
  } = useZkRegex();

  const account = useAccount();

  const [messages, setMessages] = useState<Email[]>([]);
  const [signalLength, setSignalLength] = useState<number>(1);
  const [emailUploaded, setEmailUploaded] = useState(false);

  useEffect(() => {
    console.log("Component rendered. Messages:", messages);
  }, [messages, renderTrigger]);

  useEffect(() => {
    console.log("Entry prop:", entry);
  }, [entry]);

  useEffect(() => {
    if (!inputWorkers[entry.slug] || !session?.accessToken) {
      return;
    }
    filterEmails(entry.emailQuery);
  }, [session?.accessToken, inputWorkers]);

  useEffect(() => {
    console.log("Messages state updated:", messages);
  }, [messages]);

  useEffect(() => {
    console.log("Messages state or emailUploaded changed:", { messages, emailUploaded });
  }, [messages, emailUploaded]);

  async function filterEmails(query: string) {
    try {
      const res = await fetchEmailList(session?.accessToken as string, { q: query });
      if (!res.messages) {
        throw new Error(`Failed to fetch emails`);
      }
      const messageIds = res.messages.map((message: any) => message.id);
      const emails = await fetchEmailsRaw(session?.accessToken as string, messageIds);
      const processedEmails: Email[] = [];
      for (const email of emails) {
        processedEmails.push(await mapEmail(email));
      }
      setMessages(processedEmails);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    }
  }

  useEffect(() => {
    if (workers.get(entry.slug)) {
      return;
    }
    createInputWorker(entry.slug);
    workers.set(entry.slug, true);
    setSignalLength(calculateSignalLength((entry?.parameters as any).values as any));
  }, []);

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError, error: txError } =
    useWaitForTransactionReceipt({ hash });

    async function startProofGeneration() {
        console.log("Starting proof generation");
        setIsGeneratingProof(true);
        
        try {
          const selectedMessages = messages.filter(message => message.selected && message.inputs);
          console.log("Selected messages:", selectedMessages);
    
          if (selectedMessages.length === 0) {
            console.log("No messages selected for proof generation");
            alert("Please select at least one valid email for proof generation.");
            return;
          }
    
          for (const message of selectedMessages) {
            console.log("Generating proof for message:", message.subject);
            try {
              const proofRes = await generateProofRemotely(entry.slug, message.inputs);
              console.log('Proof generation result:', proofRes);
              // You might want to update some state here to reflect the new proof
            } catch (error) {
              console.error("Error generating proof for message:", message.subject, error);
              alert(`Error generating proof for message: ${message.subject}`);
            }
          }
    
          console.log("Proof generation completed");
          alert("Proof generation completed. Check the 'View generated proofs' section.");
        } catch (error) {
          console.error("Error in proof generation process:", error);
          alert("An error occurred during the proof generation process. Please check the console for more details.");
        } finally {
          setIsGeneratingProof(false);
        }
      }

  async function mapEmail(email: RawEmailResponse): Promise<Email> {
    let inputs;
    let error, body: string | undefined;
    try {
      inputs = await generateInputFromEmail(entry.slug, email.decodedContents);
      body = inputs.emailBody ? Buffer.from(inputs.emailBody).toString('utf-8') : undefined;
      console.log("inputs", inputs);
    } catch (e: any) {
      console.error("Error generating circuit inputs: ", e);
      error = "Error generating circuit inputs: " + e;
    }
    return {
      ...email,
      selected: false,
      inputs,
      error,
      body,
    };
  }

  function displayGoogleLoginButton(isGoogleAuthed: boolean) {
    if (isGoogleAuthed) {
      return <button className="btn" onClick={() => signOut()}>Logout</button>;
    } else {
      return <button className="btn" onClick={() => signIn('google')}>Login with Google</button>;
    }
  }

  function displayEmailList() {
    console.log("Displaying email list. Messages:", JSON.stringify(messages, null, 2));
    return (
      <div className="overflow-x-auto">
        {messages.length === 0 ? (
          <p>{emailUploaded ? "Processing email..." : "No emails found. Upload an email to see it here."}</p>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th className="w-[100px]">Select</th>
                <th>Valid?</th>
                <th>Sent on</th>
                <th>Subject</th>
                <th>Generated Input</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message, index) => (
                <tr key={index}>
                  <td className="font-medium">
                    <input
                      type="checkbox"
                      className="checkbox"
                      disabled={!!message.error}
                      onChange={(e) => selectEmail(e.target.checked, index)}
                      checked={message.selected}
                    />
                  </td>
                  <td>
                    <div className="tooltip" data-tip={message.error ? message.error : "Email is valid"}>
                      {!message.error ? <Check color="green" /> : <X color="red" />}
                    </div>
                  </td>
                  <td>{new Date(message.internalDate).toLocaleString()}</td>
                  <td>{message.subject}</td>
                  <td>
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(message.inputs, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  function displayProofJobs() {
    if (Object.keys(proofStatus).length === 0) {
      return;
    } else {
      return (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="w-[100px]">Job ID</th>
                <th>Status</th>
                <th>Estimated Time Left</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(proofStatus).map((id) => (
                <tr key={id}>
                  <td className="font-medium">{proofStatus[id].id}</td>
                  <td>{proofStatus[id].status}</td>
                  <td>{proofStatus[id].estimatedTimeLeft.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  function verifyProof(id: string) {
    writeContract({
      abi: [
        {
          inputs: [
            { internalType: 'uint256[2]', name: 'a', type: 'uint256[2]' },
            { internalType: 'uint256[2][2]', name: 'b', type: 'uint256[2][2]' },
            { internalType: 'uint256[2]', name: 'c', type: 'uint256[2]' },
            {
              internalType: `uint256[${signalLength}]`,
              name: 'signals',
              type: `uint256[${signalLength}]`,
            },
          ],
          name: 'verify',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ] as const,
      address: entry.contractAddress! as Hex,
      functionName: 'verify',
      args: circuitOutputToArgs({
        proof: proofStatus[id].proof,
        public: proofStatus[id].publicOutput,
      }) as any,
    }, {
      onError: console.log,
    });
  }

  function displayProofJobsToBeVerified() {
    if (Object.keys(proofStatus).length === 0) {
      return;
    } else {
      return (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="w-[100px]">Verify</th>
                <th className="w-[100px]">Job ID</th>
                <th>Proof Output Decoded</th>
                <th>Proof</th>
                <th>Public Output</th>
                <th>Contract Calldata</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(proofStatus)
                .filter((id) => proofStatus[id].status === 'COMPLETED')
                .map((id) => (
                  <tr key={id}>
                    <td>
                      <button
                        className="btn"
                        disabled={isPending || isConfirming}
                        onClick={() => verifyProof(id)}
                      >
                        Verify
                      </button>
                    </td>
                    <td className="font-medium">{proofStatus[id].id}</td>
                    <td>
                      <pre>{JSON.stringify(parseOutput(entry, proofStatus[id].publicOutput), null, 2)}</pre>
                    </td>
                    <td>
                      <SimpleDialog title="Proof" trigger={<button className="btn btn-link">View</button>}>
                        <code>
                          <pre>{JSON.stringify(proofStatus[id].proof, null, 2)}</pre>
                        </code>
                      </SimpleDialog>
                    </td>
                    <td>
                      <SimpleDialog title="Public Output" trigger={<button className="btn btn-link">View</button>}>
                        <code>
                          <pre>{JSON.stringify(proofStatus[id].publicOutput, null, 2)}</pre>
                        </code>
                      </SimpleDialog>
                    </td>
                    <td>
                      <SimpleDialog title="Contract Calldata" trigger={<button className="btn btn-link">View</button>}>
                        <code>
                          <pre>{JSON.stringify(circuitOutputToArgs({ proof: proofStatus[id].proof, public: proofStatus[id].publicOutput }), null, 2)}</pre>
                        </code>
                      </SimpleDialog>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  function selectEmail(checked: boolean, key: number) {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages];
      newMessages[key].selected = checked;
      return newMessages;
    });
  }

  async function uploadEmail(e: FormEvent<HTMLInputElement>) {
    console.log("Uploading email");
    if (e.currentTarget.files) {
      for (let i = 0; i < e.currentTarget.files.length; i++) {
        const file = e.currentTarget.files[i];
        console.log("Processing file:", file.name);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const contents = e.target?.result;
          if (typeof contents === "string") {
            try {
              const parsed = await PostalMime.parse(contents);
              console.log("Parsed email:", JSON.stringify(parsed, null, 2));
  
              let inputs: any;
              let error: string | undefined;
  
              try {
                console.log("Generating inputs with slug:", entry.slug);
                inputs = await generateInputFromEmail(entry.slug, contents);
                console.log("Generated inputs:", JSON.stringify(inputs, null, 2));
              } catch (e: any) {
                console.error("Error generating inputs:", e);
                error = e.toString();
              }
  
              const email: Email = {
                decodedContents: contents,
                internalDate: parsed.date ? parsed.date.toString() : new Date().toISOString(),
                subject: parsed.subject || file.name,
                selected: false,
                inputs,
                error,
                body: parsed.text,
              };
  
              console.log("New email object:", JSON.stringify(email, null, 2));
  
              setMessages(prevMessages => {
                const newMessages = [...prevMessages, email];
                console.log("Updating messages state. New state:", JSON.stringify(newMessages, null, 2));
                return newMessages;
              });
  
              setEmailUploaded(true);
              setRenderTrigger(prev => prev + 1);
            } catch (error) {
              console.error("Error parsing email:", error);
            }
          }
        };
        reader.readAsText(file);
      }
    }
  }

  return (
    <div className="w-full py-20 lg:py-40">
    <div className="container mx-auto">
      <div className="flex flex-col gap-10">
        <div className="flex text-left justify-center items-center gap-4 flex-col">
          <div className="flex gap-2 flex-col w-full">
            <div className="mb-4">
              <h2 className="text-3xl md:text-5xl tracking-tighter text-left font-extrabold mb-6">
                {entry.slug}
              </h2>
              <h4 className="text-xl md:text-2xl tracking-tighter text-left font-extrabold mb-4 mt-4">
                Step 1: Provide an email sample
              </h4>
              <p className="mb-4">You can either connect your gmail or upload a .eml file. Your google API key is kept locally and never sent out to any of our servers.</p>
              {session?.user?.email && <p className="mb-2"><b>Logged in as: {session.user.email}</b></p>}
              <div className="flex flex-row">
                {displayGoogleLoginButton(!!session?.user)}
                <div>
                  <input className="ml-4" type="file" onChange={(e) => uploadEmail(e)} />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="text-xl md:text-2xl tracking-tighter text-left font-extrabold mb-4">
                Step 2: Select the emails you want the proofs created for
              </h4>
              <p>Choose the emails you want to create proofs for. You can select multiple emails.</p>
              <p>If you select to create the proofs remotely, your emails will be sent to our secured service for proof generation. Emails will be deleted once the proofs are generated</p>
              {displayEmailList()}
              <div>
                <button 
                  className="btn" 
                  onClick={startProofGeneration} 
                  disabled={isGeneratingProof}
                >
                  {isGeneratingProof ? "Generating proof..." : "Create proof remotely"}
                </button>
                <button className="btn ml-4" disabled>Create proof locally (WIP)</button>
              </div>
            </div>
              <div className="mb-4">
                <h4 className="text-2xl md:text-2xl tracking-tighter max-w-xl text-left font-extrabold mb-4">
                  Step 3: View generated proofs
                </h4>
                {displayProofJobs()}
              </div>
              <div className="mb-4">
                <h4 className="text-2xl md:text-2xl tracking-tighter max-w-xl text-left font-extrabold mb-4">
                  Step 4: Verify proofs on-chain (Sepolia)
                </h4>
                <div className="flex flex-row items-center">
                  <p><b className="font-extrabold">Verification Contract:</b> {entry.contractAddress}</p>
                  <SimpleDialog title="Verification Contract" trigger={<button className="btn btn-link font-extrabold">View ABI</button>}>
                    <code className="text-xs">
                      <pre>
                        {JSON.stringify([{
                          inputs: [
                            { internalType: 'uint256[2]', name: 'a', type: 'uint256[2]' },
                            { internalType: 'uint256[2][2]', name: 'b', type: 'uint256[2][2]' },
                            { internalType: 'uint256[2]', name: 'c', type: 'uint256[2]' },
                            {
                              internalType: `uint256[${signalLength}]`,
                              name: 'signals',
                              type: `uint256[${signalLength}]`,
                            },
                          ],
                          name: 'verify',
                          outputs: [],
                          stateMutability: 'nonpayable',
                          type: 'function',
                        }], null, 2)}
                      </pre>
                    </code>
                  </SimpleDialog>
                </div>
                <p><b className="font-bold">Groth16 Contract:</b> {entry.verifierContractAddress}</p>
                <ConnectButton />
                {displayProofJobsToBeVerified()}
                {hash && <p>Transaction hash: {hash}</p>}
                {isConfirming && <div>Waiting for confirmation...</div>}
                {isConfirmed && <div>Transaction is successful.</div>}
                {error && (
                  <div>Error: {(error as BaseError).shortMessage || error.message}</div>
                )}
                {txError && (
                  <div>Error: {(txError as BaseError).shortMessage || txError.message}</div>
                )}
              </div>
              <button className="btn mt-2" onClick={() => setRenderTrigger(prev => prev + 1)}>
                Force Re-render
                </button>
                <button className="btn mt-2" onClick={() => console.log("Current messages state:", messages)}>
                Log Messages State
                </button>
                <button 
                    className="btn mt-2" 
                    onClick={() => setMessages([...messages, {
                        subject: "Test",
                        internalDate: new Date().toISOString(),
                        selected: false,
                        decodedContents: "This is a test email content.",
                        inputs: {},
                        error: undefined,
                        body: "This is a test email body."
                    }])}>
                    Add Test Message
                    </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
                }