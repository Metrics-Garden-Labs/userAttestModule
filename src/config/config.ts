import { createGlobalState } from "react-hooks-global-state";

const initialState = {
  walletAddress: "",
};

const { useGlobalState } = createGlobalState(initialState);

export { useGlobalState };

// export const NEXT_PUBLIC_URL = "http://localhost:3000";
export const NEXT_PUBLIC_URL = "https://user-attest-module.vercel.app";
