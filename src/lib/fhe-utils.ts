// FHE utility functions for Bloom Chain Secure
// This file contains helper functions for FHE operations

export const FHE_CONSTANTS = {
  MAX_UINT32: 4294967295,
  MAX_UINT8: 255,
  MAX_UINT64: 18446744073709551615n,
} as const;

export function validateFHEInput(value: number, type: 'uint8' | 'uint32' | 'uint64'): boolean {
  switch (type) {
    case 'uint8':
      return value >= 0 && value <= FHE_CONSTANTS.MAX_UINT8;
    case 'uint32':
      return value >= 0 && value <= FHE_CONSTANTS.MAX_UINT32;
    case 'uint64':
      return value >= 0 && value <= Number(FHE_CONSTANTS.MAX_UINT64);
    default:
      return false;
  }
}

export function formatFHEError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown FHE error occurred';
}

// Convert FHE handle to proper hex format (32 bytes)
export function convertHex(handle: any): string {
  let hex = '';
  if (handle instanceof Uint8Array) {
    hex = `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  } else if (typeof handle === 'string') {
    hex = handle.startsWith('0x') ? handle : `0x${handle}`;
  } else if (Array.isArray(handle)) {
    hex = `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
  } else {
    hex = `0x${handle.toString()}`;
  }
  
  // Ensure exactly 32 bytes (66 characters including 0x)
  if (hex.length < 66) {
    hex = hex.padEnd(66, '0');
  } else if (hex.length > 66) {
    hex = hex.substring(0, 66);
  }
  return hex;
}

// Convert string to number for FHE encryption (avoid 32-bit overflow)
export function getStringValue(str: string): number {
  const first6 = str.substring(0, 6);
  let value = 0;
  for (let i = 0; i < first6.length; i++) {
    value = value * 100 + first6.charCodeAt(i);
  }
  return Math.min(value, 2000000000); // Limit to 32-bit range
}

// Convert number back to string description
export function getStringDescription(value: number): string {
  let result = '';
  let num = value;
  while (num > 0 && result.length < 6) {
    const charCode = num % 100;
    if (charCode >= 32 && charCode <= 126) {
      result = String.fromCharCode(charCode) + result;
    }
    num = Math.floor(num / 100);
  }
  return result ? `${result}...` : 'Unknown';
}

// FHE encryption helper for vault operations
export async function encryptVaultData(
  instance: any,
  contractAddress: string,
  userAddress: string,
  data: {
    riskScore?: number;
    amount?: number;
    securityScore?: number;
    severity?: number;
  }
) {
  try {
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    
    if (data.riskScore !== undefined) {
      input.add32(data.riskScore);
    }
    if (data.amount !== undefined) {
      input.add32(data.amount);
    }
    if (data.securityScore !== undefined) {
      input.add32(data.securityScore);
    }
    if (data.severity !== undefined) {
      input.add32(data.severity);
    }
    
    const encryptedInput = await input.encrypt();
    
    return {
      handles: encryptedInput.handles.map(convertHex),
      inputProof: `0x${Array.from(encryptedInput.inputProof)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`
    };
  } catch (error) {
    console.error('FHE encryption failed:', error);
    throw error;
  }
}

// FHE decryption helper for vault data
export async function decryptVaultData(
  instance: any,
  encryptedData: any[],
  contractAddress: string,
  userAddress: string
) {
  try {
    const handleContractPairs = encryptedData.map(handle => ({
      handle: convertHex(handle),
      contractAddress
    }));
    
    const result = await instance.userDecrypt(handleContractPairs, userAddress);
    
    return result;
  } catch (error) {
    console.error('FHE decryption failed:', error);
    throw error;
  }
}