import React, { useState, useEffect, FormEvent, useRef, use } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  fetchEmailList,
  fetchEmailsRaw,
  useZkRegex,
} from "@zk-email/zk-regex-sdk";
import PostalMime from "postal-mime";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { BaseError, Hex } from "viem";
import "@rainbow-me/rainbowkit/styles.css";
import { circuitOutputToArgs, parseOutput } from "@/lib/contract";
import { calculateSignalLength } from "@/lib/code-gen/utils";
import { Entry } from "@/lib/utils/types";
import { Check, X } from "lucide-react";
import { SimpleDialog } from "../components/ui/SimpleDialog";
import { ProofStatus } from "@/lib/utils/ZkRegex";
import { useSwitchChain } from "wagmi";
import InputDataDisplay from "../components/ui/EmailDataDisplay";
import FileUploadInput from "../components/ui/UploadFile";
import { useCreatGithubAttestation } from "@/hooks/useVerifyGithub";
import useLocalStorage from "@/hooks/useLocalStorage";
import AttestationCreationModal from "../components/ui/AttestationCreationModal";
import AttestationConfirmationModal from "../components/ui/AttestationConfirmationModal";

export interface ContentProps {
  entry: Entry;
}

type RawEmailResponse = {
  subject: string;
  internalDate: string;
  decodedContents: string;
};

type Email = RawEmailResponse & {
  selected: boolean;
  inputs?: any;
  error?: string;
  body?: string;
};

export function VerifyContent(props: ContentProps) {
  const workers = useRef(new Map<string, boolean>());
  const entry = props.entry;
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [renderTrigger, setRenderTrigger] = useState(0);
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
  const [isAttesting, setIsAttesting] = useState(false);
  const { createGithubAttestation, attestationUID } =
    useCreatGithubAttestation();
  const [currentAttestationUID, setCurrentAttestationUID] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { switchChain } = useSwitchChain();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [activeJob, setActiveJob] = useState(null);
  // useEffect(() => {
  //    switchChain({ chainId: 11155111});
  //   }, []);

  useEffect(() => {
    switchChain({ chainId: 11155420 });
  }, []);

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
    console.log("session token:", session?.accessToken);
    filterEmails(entry.emailQuery);
  }, [session?.accessToken, inputWorkers]);

  useEffect(() => {
    console.log("Messages state updated:", messages);
  }, [messages]);

  useEffect(() => {
    console.log("Messages state or emailUploaded changed:", {
      messages,
      emailUploaded,
    });
  }, [messages, emailUploaded]);

  const toggleJobView = (jobId: any) => {
    setActiveJob(activeJob === jobId ? null : jobId);
  };

  const renderModal = () => {
    if (!isModalOpen) return null;

    if (isAttesting) {
      return <AttestationCreationModal />;
    } else if (showConfirmation && currentAttestationUID) {
      return (
        <AttestationConfirmationModal
          attestationUID={currentAttestationUID}
          onClose={handleCloseConfirmation}
        />
      );
    }
    return null;
  };

  const onClose = () => {
    setIsModalOpen(false);
    setShowConfirmation(false);
    setCurrentAttestationUID(null);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setCurrentAttestationUID(null);
    onClose(); // Close the entire modal after confirmation
  };

  async function filterEmails(query: string) {
    try {
      const res = await fetchEmailList(session?.accessToken as string, {
        q: query,
      });
      if (!res.messages) {
        throw new Error("Failed to fetch emails");
      }
      const messageIds = res.messages.map((message: any) => message.id);
      const emails = await fetchEmailsRaw(
        session?.accessToken as string,
        messageIds
      );
      const processedEmails: Email[] = [];
      for (const email of emails) {
        processedEmails.push(await mapEmail(email));
      }
      setMessages(processedEmails);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    }
  }

  useEffect(() => {
    if (workers.current.get(entry.slug)) {
      return;
    }
    createInputWorker(entry.slug);
    workers.current.set(entry.slug, true);
    setSignalLength(calculateSignalLength(entry.parameters.values));
  }, [entry, createInputWorker]);

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
    error: txError,
  } = useWaitForTransactionReceipt({ hash });

  const handleAttestation = async () => {
    if (!hash) {
      alert("Please verify your proof on-chain first.");
      return;
    }

    setIsAttesting(true);
    setIsModalOpen(true);
    try {
      const newAttestationUID = await createGithubAttestation(hash);
      if (newAttestationUID) {
        setCurrentAttestationUID(newAttestationUID);
        setShowConfirmation(true);
      } else {
        throw new Error("Failed to create attestation");
      }
    } catch (error) {
      console.error("Error attesting ownership:", error);
      alert("Failed to attest ownership. Please try again.");
    } finally {
      setIsAttesting(false);
    }
  };

  async function startProofGeneration() {
    console.log("Starting proof generation");
    setIsGeneratingProof(true);

    try {
      const selectedMessages = messages.filter(
        (message) => message.selected && message.inputs
      );
      console.log("Selected messages:", selectedMessages);

      if (selectedMessages.length === 0) {
        console.log("No messages selected for proof generation");
        alert("Please select at least one valid email for proof generation.");
        return;
      }

      for (const message of selectedMessages) {
        console.log("Generating proof for message:", message.subject);
        try {
          const proofRes = await generateProofRemotely(
            entry.slug,
            message.inputs
          );
          console.log("Proof generation result:", proofRes);
          // You might want to update some state here to reflect the new proof
        } catch (error) {
          console.error(
            "Error generating proof for message:",
            message.subject,
            error
          );
          alert(`Error generating proof for message: ${message.subject}`);
        }
      }

      console.log("Proof generation completed");
      //   alert("Proof generation completed. Check the 'View generated proofs' section.");
    } catch (error) {
      console.error("Error in proof generation process:", error);
      alert(
        "An error occurred during the proof generation process. Please check the console for more details."
      );
    } finally {
      setIsGeneratingProof(false);
    }
  }

  async function mapEmail(email: RawEmailResponse): Promise<Email> {
    let inputs;
    let error, body: string | undefined;
    try {
      inputs = await generateInputFromEmail(entry.slug, email.decodedContents);
      body = inputs.emailBody
        ? Buffer.from(inputs.emailBody).toString("utf-8")
        : undefined;
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

  function DisplayGoogleLoginButton() {
    const { data: session, status } = useSession();

    const isGoogleAuthed = !!session?.user?.googleEmail;

    return (
      <button
        className={`
          px-4 py-2 h-12 rounded-md font-medium text-white
          shadow-md transition-all duration-300 ease-in-out
          ${
            isGoogleAuthed
              ? "bg-red-500 hover:bg-red-600"
              : "btn btn-primary px-6 py-1 mt-2 bg-[#424242] cursor-pointer text-white font-thin rounded-md hover:bg-black"
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isGoogleAuthed ? "focus:ring-red-500" : "focus:ring-[#424242]"}
        `}
        onClick={() => (isGoogleAuthed ? signOut() : signIn("google"))}
        disabled={status === "loading"}
      >
        {status === "loading"
          ? "Loading..."
          : isGoogleAuthed
          ? "Logout from Google"
          : "Login with Google"}
      </button>
    );
  }

  function displayEmailList() {
    console.log(
      "Displaying email list. Messages:",
      JSON.stringify(messages, null, 2)
    );
    return (
      <div className="overflow-x-auto">
        {messages.length === 0 ? (
          <p>
            {emailUploaded
              ? "Processing email..."
              : "No emails found. Upload an email to see it here."}
          </p>
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
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-6 h-6 border-2 rounded flex items-center justify-center cursor-pointer
                        ${
                          message.error
                            ? "bg-gray-200 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }
                        ${
                          message.selected
                            ? "bg-[#424242] border-black"
                            : "border-gray-300"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!message.error) {
                            selectEmail(!message.selected, index);
                          }
                        }}
                      >
                        {message.selected && <Check size={16} color="blue" />}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      className="tooltip"
                      data-tip={
                        message.error ? message.error : "Email is valid"
                      }
                    >
                      {!message.error ? (
                        <Check color="green" />
                      ) : (
                        <X color="red" />
                      )}
                    </div>
                  </td>
                  <td>{new Date(message.internalDate).toLocaleString()}</td>
                  <td>{message.subject}</td>
                  <td>
                    <InputDataDisplay inputs={message.inputs || {}} />
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
    writeContract(
      {
        abi: [
          {
            inputs: [
              { internalType: "uint256[2]", name: "a", type: "uint256[2]" },
              {
                internalType: "uint256[2][2]",
                name: "b",
                type: "uint256[2][2]",
              },
              { internalType: "uint256[2]", name: "c", type: "uint256[2]" },
              {
                internalType: `uint256[${signalLength}]`,
                name: "signals",
                type: `uint256[${signalLength}]`,
              },
            ],
            name: "verify",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ] as const,
        address: entry.contractAddress! as Hex,
        functionName: "verify",
        args: circuitOutputToArgs({
          proof: proofStatus[id].proof,
          public: proofStatus[id].publicOutput,
        }) as any,
      },
      {
        onError: console.log,
      }
    );
  }

  function displayProofJobsToBeVerified() {
    if (Object.keys(proofStatus).length === 0) {
      return null;
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
                .filter((id) => proofStatus[id].status === "COMPLETED")
                .map((id) => (
                  <React.Fragment key={id}>
                    <tr>
                      <td>
                        <button
                          className="btn btn-primary px-6 py-1 mt-2 bg-[#424242] cursor-pointer text-white font-thin rounded-md hover:bg-black"
                          disabled={isPending || isConfirming}
                          onClick={() => {
                            console.log("Button state:", {
                              isPending,
                              isConfirming,
                            });
                            verifyProof(id);
                          }}
                        >
                          Verify
                        </button>
                      </td>
                      <td className="font-medium">{proofStatus[id].id}</td>
                      <td>
                        <pre>
                          {JSON.stringify(
                            parseOutput(
                              entry.parameters,
                              proofStatus[id].publicOutput
                            ),
                            null,
                            2
                          )}
                        </pre>
                      </td>
                      <td>
                        <button
                          className="btn btn-link"
                          onClick={() => toggleJobView(`proof-${id}`)}
                        >
                          View
                        </button>
                        {activeJob === `proof-${id}` && (
                          <pre className="whitespace-pre-wrap mt-2">
                            <code>
                              {JSON.stringify(proofStatus[id].proof, null, 2)}
                            </code>
                          </pre>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-link"
                          onClick={() => toggleJobView(`public-${id}`)}
                        >
                          View
                        </button>
                        {activeJob === `public-${id}` && (
                          <pre className="whitespace-pre-wrap mt-2">
                            <code>
                              {JSON.stringify(
                                proofStatus[id].publicOutput,
                                null,
                                2
                              )}
                            </code>
                          </pre>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-link"
                          onClick={() => toggleJobView(`calldata-${id}`)}
                        >
                          View
                        </button>
                        {activeJob === `calldata-${id}` && (
                          <pre className="whitespace-pre-wrap mt-2">
                            <code>
                              {JSON.stringify(
                                circuitOutputToArgs({
                                  proof: proofStatus[id].proof,
                                  public: proofStatus[id].publicOutput,
                                }),
                                null,
                                2
                              )}
                            </code>
                          </pre>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  function selectEmail(checked: boolean, key: number) {
    setMessages((prevMessages) => {
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
                console.log(
                  "Generated inputs:",
                  JSON.stringify(inputs, null, 2)
                );
              } catch (e: any) {
                console.error("Error generating inputs:", e);
                error = "Error generating inputs: " + e.message;
              }

              const email: Email = {
                decodedContents: contents,
                internalDate: parsed.date
                  ? parsed.date.toString()
                  : new Date().toISOString(),
                subject: parsed.subject || file.name,
                selected: true,
                inputs,
                error,
                body: parsed.text,
              };

              console.log("New email object:", JSON.stringify(email, null, 2));

              setMessages((prevMessages) => {
                const newMessages = [...prevMessages, email];
                console.log(
                  "Updating messages state. New state:",
                  JSON.stringify(newMessages, null, 2)
                );
                return newMessages;
              });

              setEmailUploaded(true);
              setRenderTrigger((prev) => prev + 1);
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
    <div className="min-h-screen w-full" onClick={(e) => e.stopPropagation}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">
          Verify Ownership of your Github account!
        </h2>

        <div className="space-y-8">
          <section>
            <h4 className="text-xl font-semibold mb-4">
              1. Please provide an email sample
            </h4>
            <ul className="list-disc pl-5 mb-4">
              <li>
                You can either connect your Gmail using the button below or
                upload / drag & drop a .eml file.
              </li>
              <li>Nothing touches our servers, everything is client side!</li>
            </ul>
            <div className="flex items-center space-x-4 mt-4">
              {DisplayGoogleLoginButton()}
              <FileUploadInput onUpload={(e) => uploadEmail(e)} />
            </div>
            {session?.user?.googleEmail && (
              <p className="mt-2">
                Logged in as: <b>{session.user.googleEmail}</b>
              </p>
            )}
          </section>

          <section>
            <h4 className="text-xl font-semibold mb-4">
              2. Select the emails you want the proofs created for
            </h4>
            <p className="mb-2">
              Choose the emails you want to create proofs for. You can select
              multiple emails.
            </p>
            <p className="mb-4">
              If you select to create the proofs remotely, your emails will be
              sent to our secured service for proof generation. Emails will be
              deleted once the proofs are generated.
            </p>
            {displayEmailList()}
            <button
              className="btn btn-primary px-6 py-1 mt-2 bg-[#424242] cursor-pointer text-white font-thin rounded-md hover:bg-black"
              onClick={startProofGeneration}
              disabled={isGeneratingProof}
            >
              {isGeneratingProof
                ? "Generating proof..."
                : "Create proof remotely"}
            </button>
          </section>

          <section>
            <h4 className="text-xl font-semibold mb-4">
              3. View generated proofs
            </h4>
            {displayProofJobs()}
          </section>

          <section>
            <h4 className="text-xl font-semibold mb-4">
              4. Verify proofs on-chain (Sepolia)
            </h4>
            <p>
              <b>Verification Contract:</b> {entry.contractAddress}
            </p>
            <p>
              <b>Groth16 Contract:</b> {entry.verifierContractAddress}
            </p>
            {displayProofJobsToBeVerified()}
            {hash && <p>Transaction hash: {hash}</p>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction is successful.</div>}
            {error && (
              <div>
                Error: {(error as BaseError).shortMessage || error.message}
              </div>
            )}
            {txError && (
              <div>
                Error: {(txError as BaseError).shortMessage || txError.message}
              </div>
            )}
          </section>

          <section>
            <h4 className="text-xl font-semibold mb-4">
              5. Attest to your Ownership!
            </h4>
            <p className="mb-4">
              Once you have verified your proofs on-chain, you can attest to
              your ownership of the Github account.
            </p>
            <button
              className="btn btn-primary px-6 py-1 mt-2 bg-[#424242] cursor-pointer text-white font-thin rounded-md hover:bg-black"
              onClick={handleAttestation}
            >
              Attest Ownership
            </button>
            <p className="mt-2">Here is a link to your attestation!</p>
          </section>
        </div>
        {renderModal()}
      </div>
    </div>
  );
}
