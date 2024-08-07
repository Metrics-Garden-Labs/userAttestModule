import { createGlobalState } from "react-hooks-global-state";

const initialState = {
  walletAddress: "",
};

const { useGlobalState } = createGlobalState(initialState);

export { useGlobalState };

export const NEXT_PUBLIC_URL = "http://localhost:3000";
