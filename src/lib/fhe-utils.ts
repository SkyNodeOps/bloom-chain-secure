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
    console.log('🚀 Starting FHE vault data encryption process...');
    console.log('📊 Input data:', {
      contractAddress,
      userAddress,
      data
    });
    
    console.log('🔄 Step 1: Creating encrypted input...');
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    console.log('✅ Step 1 completed: Encrypted input created');
    
    console.log('🔄 Step 2: Adding encrypted data...');
    
    // Validate all values are within 32-bit range
    const max32Bit = 4294967295; // 2^32 - 1
    
    if (data.riskScore !== undefined) {
      console.log('📊 Adding risk score:', data.riskScore);
      if (data.riskScore > max32Bit) {
        throw new Error(`Risk score ${data.riskScore} exceeds 32-bit limit`);
      }
      input.add32(BigInt(data.riskScore));
    }
    
    if (data.amount !== undefined) {
      console.log('📊 Adding amount:', data.amount);
      if (data.amount > max32Bit) {
        throw new Error(`Amount ${data.amount} exceeds 32-bit limit`);
      }
      input.add32(BigInt(data.amount));
    }
    
    if (data.securityScore !== undefined) {
      console.log('📊 Adding security score:', data.securityScore);
      if (data.securityScore > max32Bit) {
        throw new Error(`Security score ${data.securityScore} exceeds 32-bit limit`);
      }
      input.add32(BigInt(data.securityScore));
    }
    
    if (data.severity !== undefined) {
      console.log('📊 Adding severity:', data.severity);
      if (data.severity > max32Bit) {
        throw new Error(`Severity ${data.severity} exceeds 32-bit limit`);
      }
      input.add32(BigInt(data.severity));
    }
    
    console.log('✅ Step 2 completed: All data added to encrypted input');
    
    console.log('🔄 Step 3: Encrypting data...');
    const encryptedInput = await input.encrypt();
    console.log('✅ Step 3 completed: Data encrypted successfully');
    console.log('📊 Encrypted handles count:', encryptedInput.handles.length);
    
    console.log('🔄 Step 4: Converting handles to hex format...');
    const handles = encryptedInput.handles.map((handle, index) => {
      const hex = convertHex(handle);
      console.log(`📊 Handle ${index}: ${hex.substring(0, 10)}... (${hex.length} chars)`);
      return hex;
    });
    
    const proof = `0x${Array.from(encryptedInput.inputProof)
      .map((b: number) => b.toString(16).padStart(2, '0')).join('')}`;
    console.log('📊 Proof length:', proof.length);
    
    console.log('🎉 Vault data encryption completed successfully!');
    console.log('📊 Final result:', {
      handlesCount: handles.length,
      proofLength: proof.length,
      handles: handles.map(h => h.substring(0, 10) + '...')
    });
    
    return {
      handles,
      inputProof: proof
    };
  } catch (error) {
    console.error('❌ FHE vault data encryption failed:', error);
    console.error('📊 Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      contractAddress,
      userAddress,
      data
    });
    throw error;
  }
}

// FHE decryption helper for vault data
export async function decryptVaultData(
  instance: any,
  encryptedData: any[],
  contractAddress: string,
  userAddress: string,
  signer: any
) {
  try {
    console.log('🚀 Starting FHE vault data decryption process...');
    console.log('📊 Input parameters:', {
      encryptedDataLength: encryptedData.length,
      contractAddress,
      userAddress
    });
    
    // Check if FHE instance has proper keypair
    if (!instance || typeof instance.userDecrypt !== 'function') {
      throw new Error('FHE instance not properly initialized');
    }
    
    // Validate encrypted data format
    if (!encryptedData || encryptedData.length === 0) {
      throw new Error('No encrypted data provided');
    }
    
    console.log('🔄 Step 1: Generating keypair...');
    const keypair = instance.generateKeypair();
    console.log('✅ Step 1 completed: Keypair generated');
    
    console.log('🔄 Step 2: Building handle-contract pairs...');
    const handleContractPairs = encryptedData.map((handle, index) => {
      const hex = convertHex(handle);
      console.log(`📊 Handle ${index}: ${hex.substring(0, 10)}... (${hex.length} chars)`);
      return {
        handle: hex,
        contractAddress
      };
    });
    console.log('✅ Step 2 completed: Handle-contract pairs built');
    console.log('📊 Pairs count:', handleContractPairs.length);
    
    console.log('🔄 Step 3: Creating EIP712 signature...');
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '10';
    const contractAddresses = [contractAddress];
    
    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );
    
    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message,
    );
    console.log('✅ Step 3 completed: EIP712 signature created');
    
    console.log('🔄 Step 4: Decrypting handles...');
    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      userAddress,
      startTimeStamp,
      durationDays
    );
    console.log('✅ Step 4 completed: Handles decrypted');
    console.log('📊 Decryption result keys:', Object.keys(result || {}));
    
    console.log('🔄 Step 5: Parsing decrypted data...');
    const decryptedData = {
      riskScore: result[handleContractPairs[0]?.handle]?.toString() || '0',
      amount: result[handleContractPairs[1]?.handle]?.toString() || '0',
      securityScore: result[handleContractPairs[2]?.handle]?.toString() || '0',
      severity: result[handleContractPairs[3]?.handle]?.toString() || '0'
    };
    console.log('✅ Step 5 completed: Data parsed successfully');
    console.log('📊 Decrypted data:', decryptedData);
    
    console.log('🎉 Vault data decryption completed successfully!');
    return result;
  } catch (error) {
    console.error('❌ FHE vault data decryption failed:', error);
    console.error('📊 Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      encryptedDataLength: encryptedData.length,
      contractAddress,
      userAddress
    });
    
    // Provide specific error guidance
    if (error?.message?.includes('Invalid public or private key')) {
      console.log('💡 Suggestion: This data may have been encrypted with a different keypair. Try refreshing the page.');
      throw new Error('Data encrypted with different keypair. Please refresh the page and try again.');
    } else if (error?.message?.includes('Cannot read properties of undefined')) {
      console.log('💡 Suggestion: FHE SDK internal error. Please refresh the page.');
      throw new Error('FHE SDK error. Please refresh the page and try again.');
    }
    
    throw error;
  }
}

// Carbon offset trading encryption (参考fantasy-vault-trade实现)
export async function encryptCarbonOrder(
  instance: any,
  contractAddress: string,
  userAddress: string,
  orderData: {
    orderType: number; // 1: Buy, 2: Sell
    quantity: number; // Tons of CO2
    price: number; // Price per ton * 100
    offsetSymbol: string; // Offset symbol
  }
) {
  try {
    console.log('🚀 Starting FHE carbon order encryption process...');
    console.log('📊 Input data:', {
      contractAddress,
      userAddress,
      orderData
    });
    
    console.log('🔄 Step 1: Creating encrypted input...');
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    console.log('✅ Step 1 completed: Encrypted input created');
    
    console.log('🔄 Step 2: Adding encrypted data...');
    
    // Validate all values are within 32-bit range
    const max32Bit = 4294967295; // 2^32 - 1
    
    console.log('📊 Adding order type:', orderData.orderType);
    if (orderData.orderType > max32Bit) {
      throw new Error(`Order type ${orderData.orderType} exceeds 32-bit limit`);
    }
    input.add32(BigInt(orderData.orderType));
    
    console.log('📊 Adding quantity:', orderData.quantity);
    if (orderData.quantity > max32Bit) {
      throw new Error(`Quantity ${orderData.quantity} exceeds 32-bit limit`);
    }
    input.add32(BigInt(orderData.quantity));
    
    const priceInCents = Math.floor(orderData.price * 100);
    console.log('📊 Adding price (in cents):', priceInCents);
    if (priceInCents > max32Bit) {
      throw new Error(`Price ${priceInCents} exceeds 32-bit limit`);
    }
    input.add32(BigInt(priceInCents));
    
    const symbolValue = getStringValue(orderData.offsetSymbol);
    console.log('📊 Adding offset symbol (converted):', symbolValue);
    if (symbolValue > max32Bit) {
      throw new Error(`Offset symbol value ${symbolValue} exceeds 32-bit limit`);
    }
    input.add32(BigInt(symbolValue));
    
    console.log('✅ Step 2 completed: All data added to encrypted input');
    
    console.log('🔄 Step 3: Encrypting data...');
    const encryptedInput = await input.encrypt();
    console.log('✅ Step 3 completed: Data encrypted successfully');
    console.log('📊 Encrypted handles count:', encryptedInput.handles.length);
    
    console.log('🔄 Step 4: Converting handles to hex format...');
    const handles = encryptedInput.handles.map((handle, index) => {
      const hex = convertHex(handle);
      console.log(`📊 Handle ${index}: ${hex.substring(0, 10)}... (${hex.length} chars)`);
      return hex;
    });
    
    const proof = `0x${Array.from(encryptedInput.inputProof)
      .map((b: number) => b.toString(16).padStart(2, '0')).join('')}`;
    console.log('📊 Proof length:', proof.length);
    
    console.log('🎉 Carbon order encryption completed successfully!');
    console.log('📊 Final result:', {
      handlesCount: handles.length,
      proofLength: proof.length,
      handles: handles.map(h => h.substring(0, 10) + '...')
    });
    
    return { handles, proof };
  } catch (error) {
    console.error('❌ FHE carbon order encryption failed:', error);
    console.error('📊 Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      orderData
    });
    throw error;
  }
}

// Test FHE functionality (参考fantasy-vault-trade实现)
export async function testFHEFunctionality(instance: any) {
  try {
    console.log('🧪 Testing FHE functionality...');
    
    const testData = {
      orderType: 1,
      quantity: 100,
      price: 12.50,
      offsetSymbol: 'AMAZON'
    };
    
    // Test encryption
    const encrypted = await encryptCarbonOrder(
      instance,
      '0x0000000000000000000000000000000000000000', // Test address
      '0x0000000000000000000000000000000000000000', // Test user
      testData
    );
    
    console.log('✅ FHE Test Successful! Encrypted', encrypted.handles.length, 'handles');
    return true;
  } catch (error) {
    console.error('❌ FHE Test Failed:', error);
    return false;
  }
}