import { useAccount, useWalletClient } from 'wagmi';
import { useMemo } from 'react';
import { providers } from 'ethers';

export function useEthersSigner() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const signer = useMemo(() => {
    if (!walletClient || !address) return null;
    
    return {
      getAddress: () => address,
      signMessage: async (message: string) => {
        return await walletClient.signMessage({ message });
      },
      signTypedData: async (domain: any, types: any, value: any) => {
        return await walletClient.signTypedData({
          account: address as `0x${string}`,
          domain,
          types,
          primaryType: 'UserDecryptRequestVerification',
          message: value,
        });
      },
    };
  }, [walletClient, address]);

  return { signer, isConnected, address };
}
