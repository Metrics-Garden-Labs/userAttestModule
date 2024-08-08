import { foundry, mainnet, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { toHex } from "viem";
// import { Entry } from "@prisma/client";

export const config = getDefaultConfig({
  appName: "ZK Regex Registry",
  projectId: "7a5727ef2bfa0be0186ec17111b106b0",
  chains: [sepolia, foundry],
  wallets: [
    {
      groupName: "default",
      wallets: [metaMaskWallet, rabbyWallet, rainbowWallet],
    },
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

type Proof = {
  proof: {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
  };
  public: string[];
};

export const circuitOutputToArgs = (output: Proof) => {
  return [
    [toHex(BigInt(output.proof.pi_a[0])), toHex(BigInt(output.proof.pi_a[1]))],
    [
      [
        toHex(BigInt(output.proof.pi_b[0][1])),
        toHex(BigInt(output.proof.pi_b[0][0])),
      ],
      [
        toHex(BigInt(output.proof.pi_b[1][1])),
        toHex(BigInt(output.proof.pi_b[1][0])),
      ],
    ],
    [toHex(BigInt(output.proof.pi_c[0])), toHex(BigInt(output.proof.pi_c[1]))],
    output.public.map((x) => toHex(BigInt(x))),
  ];
};

function bytesToString(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

function packedNBytesToString(packedBytes: bigint[], n = 31) {
  const chars = [];
  for (let i = 0; i < packedBytes.length; i++) {
    for (let k = BigInt(0); k < n; k++) {
      chars.push(Number((packedBytes[i] >> (k * BigInt(8))) % BigInt(256)));
    }
  }
  return bytesToString(Uint8Array.from(chars));
}

// export const parseOutput = (entry: Entry, output: string[]) => {
//   let i = 1;
//   let result = {};
//   if (!entry.parameters) {
//     return result;
//   }
//   for (const value of (entry.parameters as any).values) {
//     const packLength =
//       Math.floor(value.maxLength / 31) + (value.maxLength % 31 ? 1 : 0);
//     const data = output.slice(i, i + packLength);
//     const unpackedValue = packedNBytesToString(data.map(BigInt)).replaceAll(
//       "\u0000",
//       ""
//     );
//     i += packLength;
//     result = {
//       ...result,
//       [value.name]: unpackedValue,
//     };
//   }
//   return result;
// };

export const parseOutput = (parameters: any, output: string[]) => {
  let i = 1;
  let result: Record<string, string> = {};
  if (!parameters) {
    return result;
  }
  for (const value of parameters.values) {
    const packLength =
      Math.floor(value.maxLength / 31) + (value.maxLength % 31 ? 1 : 0);
    const data = output.slice(i, i + packLength);
    const unpackedValue = packedNBytesToString(data.map(BigInt)).replaceAll(
      "\u0000",
      ""
    );
    i += packLength;
    result = {
      ...result,
      [value.name]: unpackedValue,
    };
  }
  return result;
};
