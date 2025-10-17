import { useWriteContract, useReadContract } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { encryptVaultData, decryptVaultData } from './fhe-utils';

// Contract ABI for BloomChainSecure
export const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "bytes32", "name": "_initialRiskScore", "type": "bytes32"},
      {"internalType": "bytes", "name": "_inputProof", "type": "bytes"}
    ],
    "name": "createVault",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_vaultId", "type": "uint256"},
      {"internalType": "bytes32", "name": "_amount", "type": "bytes32"},
      {"internalType": "bytes", "name": "_inputProof", "type": "bytes"}
    ],
    "name": "depositToVault",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_vaultId", "type": "uint256"},
      {"internalType": "bytes32", "name": "_amount", "type": "bytes32"},
      {"internalType": "bytes", "name": "_inputProof", "type": "bytes"}
    ],
    "name": "withdrawFromVault",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_vaultId", "type": "uint256"},
      {"internalType": "bytes32", "name": "_riskScore", "type": "bytes32"},
      {"internalType": "bytes32", "name": "_securityScore", "type": "bytes32"},
      {"internalType": "bytes", "name": "_inputProof", "type": "bytes"}
    ],
    "name": "updateSecurityMetrics",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_vaultId", "type": "uint256"},
      {"internalType": "string", "name": "_alertType", "type": "string"},
      {"internalType": "string", "name": "_message", "type": "string"},
      {"internalType": "bytes32", "name": "_severity", "type": "bytes32"},
      {"internalType": "bytes", "name": "_inputProof", "type": "bytes"}
    ],
    "name": "reportSecurityAlert",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_vaultId", "type": "uint256"}],
    "name": "getVaultInfo",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "uint256", "name": "lastActivity", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserVaults",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract address (will be updated after deployment)
export const CONTRACT_ADDRESS = "0x2537B6e0e739A5d3Be29f5ccfE76784DF0DBd310"; // Placeholder

// Hook for contract interactions
export function useContract() {
  const { instance } = useZamaInstance();
  const { address } = useEthersSigner();
  const { writeContractAsync } = useWriteContract();

  const createVault = async (
    name: string,
    description: string,
    riskScore: number
  ) => {
    if (!instance || !address) {
      throw new Error('FHE instance or wallet not ready');
    }

    try {
      const encryptedData = await encryptVaultData(
        instance,
        CONTRACT_ADDRESS,
        address,
        { riskScore }
      );

      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createVault',
        args: [
          name,
          description,
          encryptedData.handles[0],
          encryptedData.inputProof
        ],
      });

      return tx;
    } catch (error) {
      console.error('Failed to create vault:', error);
      throw error;
    }
  };

  const depositToVault = async (
    vaultId: number,
    amount: number,
    ethAmount: string
  ) => {
    if (!instance || !address) {
      throw new Error('FHE instance or wallet not ready');
    }

    try {
      const encryptedData = await encryptVaultData(
        instance,
        CONTRACT_ADDRESS,
        address,
        { amount }
      );

      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'depositToVault',
        args: [
          vaultId,
          encryptedData.handles[0],
          encryptedData.inputProof
        ],
        value: BigInt(ethAmount),
      });

      return tx;
    } catch (error) {
      console.error('Failed to deposit to vault:', error);
      throw error;
    }
  };

  const withdrawFromVault = async (
    vaultId: number,
    amount: number
  ) => {
    if (!instance || !address) {
      throw new Error('FHE instance or wallet not ready');
    }

    try {
      const encryptedData = await encryptVaultData(
        instance,
        CONTRACT_ADDRESS,
        address,
        { amount }
      );

      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'withdrawFromVault',
        args: [
          vaultId,
          encryptedData.handles[0],
          encryptedData.inputProof
        ],
      });

      return tx;
    } catch (error) {
      console.error('Failed to withdraw from vault:', error);
      throw error;
    }
  };

  const updateSecurityMetrics = async (
    vaultId: number,
    riskScore: number,
    securityScore: number
  ) => {
    if (!instance || !address) {
      throw new Error('FHE instance or wallet not ready');
    }

    try {
      const encryptedData = await encryptVaultData(
        instance,
        CONTRACT_ADDRESS,
        address,
        { riskScore, securityScore }
      );

      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'updateSecurityMetrics',
        args: [
          vaultId,
          encryptedData.handles[0],
          encryptedData.handles[1],
          encryptedData.inputProof
        ],
      });

      return tx;
    } catch (error) {
      console.error('Failed to update security metrics:', error);
      throw error;
    }
  };

  const reportSecurityAlert = async (
    vaultId: number,
    alertType: string,
    message: string,
    severity: number
  ) => {
    if (!instance || !address) {
      throw new Error('FHE instance or wallet not ready');
    }

    try {
      const encryptedData = await encryptVaultData(
        instance,
        CONTRACT_ADDRESS,
        address,
        { severity }
      );

      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'reportSecurityAlert',
        args: [
          vaultId,
          alertType,
          message,
          encryptedData.handles[0],
          encryptedData.inputProof
        ],
      });

      return tx;
    } catch (error) {
      console.error('Failed to report security alert:', error);
      throw error;
    }
  };

  return {
    createVault,
    depositToVault,
    withdrawFromVault,
    updateSecurityMetrics,
    reportSecurityAlert,
  };
}
