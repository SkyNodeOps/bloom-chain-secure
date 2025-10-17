import { useAccount, useWalletClient } from 'wagmi';
import { useMemo } from 'react';
import { providers } from 'ethers';

export function useEthersSigner() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const signerPromise = useMemo(async () => {
    if (!walletClient || !address) return null;
    
    try {
      const { createWalletClient, custom } = await import('viem');
      const { createPublicClient, http } = await import('viem');
      const { mainnet, sepolia } = await import('viem/chains');
      
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      const client = createWalletClient({
        account: address as `0x${string}`,
        chain: sepolia,
        transport: custom(walletClient),
      });

      return {
        getAddress: () => address,
        signMessage: async (message: string) => {
          return await client.signMessage({ message });
        },
        signTypedData: async (domain: any, types: any, value: any) => {
          return await client.signTypedData({
            account: address as `0x${string}`,
            domain,
            types,
            primaryType: 'Message',
            message: value,
          });
        },
        provider: publicClient,
      };
    } catch (error) {
      console.error('Failed to create ethers signer:', error);
      return null;
    }
  }, [walletClient, address]);

  return { signerPromise, isConnected, address };
}
