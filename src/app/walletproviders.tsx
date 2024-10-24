'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
    RainbowKitProvider,
    getDefaultWallets,
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    scroll,
    celo,
    blast,
    linea,
    sepolia,
    optimismSepolia
    
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount } from 'wagmi';
import { useGlobalState } from '../config/config';
import { createWeb3Modal }  from '@web3modal/wagmi/react';

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
    appName: 'module3',
    projectId: 'fd9485b2313c31a14cd8fd4cdb94893f',
    wallets: [
        ...wallets,
        {
            groupName: 'Other',
            wallets: [argentWallet, trustWallet, ledgerWallet],
        },
    ],
    chains: [
        mainnet,
        polygon,
        optimism,
        optimismSepolia,
        arbitrum,
        base,
        scroll,
        celo,
        blast,
        linea,
        sepolia,
        // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
    ssr: true,
});

const queryClient = new QueryClient();

createWeb3Modal({
    wagmiConfig: config,
    projectId : 'c27d268679e49f9421c25328afdddccc',
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    enableOnramp: true // Optional - false as default
  })

export function WalletProviders({ children }: { children: React.ReactNode }) {

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <GlobalStateProvider>
                    <RainbowKitProvider initialChain={10} >
                        {children}
                    </RainbowKitProvider>
                </GlobalStateProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { address } = useAccount();
    const [, setWalletAddress] = useGlobalState('walletAddress');
    console.log('address', address);


    React.useEffect(() => {
        if (address) {
            setWalletAddress(address);
        } else {
            setWalletAddress('');
        }
    }, [address, setWalletAddress]);

    return <>{children}</>;
};