import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Leaf,
  RefreshCw
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useContract } from '../lib/contract';
import { decryptVaultData } from '../lib/fhe-utils';
import { CONTRACT_ADDRESS } from '../config/contracts';

interface Order {
  id: string;
  symbol: string;
  name: string;
  orderType: 'Buy' | 'Sell';
  quantity: number;
  price: number;
  totalValue: number;
  status: 'Pending' | 'Executed' | 'Cancelled';
  timestamp: string;
  encryptedData?: {
    handles: string[];
    proof: string;
  };
}

export const OrderHistory = () => {
  const { address, isConnected } = useAccount();
  const { instance, isLoading: fheLoading, error: fheError } = useZamaInstance();
  const signerPromise = useEthersSigner();
  const { getCarbonOffsets, getUserCarbonOrderIds, getCarbonOrderEncryptedData, getCarbonOrderInfo } = useContract();
  const [orders, setOrders] = useState<Order[]>([]);
  const [carbonOffsets, setCarbonOffsets] = useState<any[]>([]);
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [decryptedOrders, setDecryptedOrders] = useState<Record<string, any>>({});
  const [contractError, setContractError] = useState<string | null>(null);

  // Note: No mock data - all orders are loaded from the smart contract

  // Load carbon offsets from contract
  const loadCarbonOffsets = async () => {
    try {
      console.log('🔄 Loading carbon offsets from contract...');
      const offsets = await getCarbonOffsets();
      setCarbonOffsets(offsets);
      console.log('✅ Carbon offsets loaded:', offsets.length);
    } catch (error) {
      console.error('❌ Failed to load carbon offsets:', error);
    }
  };

  // Load orders from contract
  const loadOrdersFromContract = async () => {
    if (!address) return;
    
    setIsLoadingOrders(true);
    setContractError(null);
    try {
      console.log('🔄 Loading orders from contract for address:', address);
      console.log('📊 Contract address:', CONTRACT_ADDRESS);
      
      // Step 1: Get user's order IDs from contract
      console.log('📊 Step 1: Getting user order IDs...');
      const orderIds = await getUserCarbonOrderIds(address);
      console.log('✅ Step 1 completed: Found', orderIds.length, 'orders');
      
      if (orderIds.length === 0) {
        console.log('📊 No orders found for user');
        setOrders([]);
        setContractError('No orders found for this address');
        return;
      }
      
      // Step 2: Load each order's data from contract
      console.log('📊 Step 2: Loading order data...');
      const ordersData = await Promise.all(orderIds.map(async (orderId) => {
        try {
          console.log('📊 Loading order', orderId.toString());
          
          // Get basic order info (non-encrypted)
          const orderInfo = await getCarbonOrderInfo(Number(orderId));
          console.log('📊 Order info:', orderInfo);
          
          // Get encrypted order data
          const encryptedData = await getCarbonOrderEncryptedData(Number(orderId));
          console.log('📊 Encrypted data handles:', encryptedData.length);
          console.log('📊 Raw encrypted data:', encryptedData);
          
          // Convert encrypted data to handles format
          const handles = encryptedData.slice(0, 4).map((handle, index) => {
            const hexHandle = typeof handle === 'string' ? handle : `0x${handle.toString(16).padStart(64, '0')}`;
            console.log(`📊 Handle ${index}: ${hexHandle.substring(0, 10)}... (${hexHandle.length} chars)`);
            return hexHandle;
          });
          
          // Find matching carbon offset for display
          const matchingOffset = carbonOffsets.find(offset => 
            offset.symbol === 'AMAZON' // This would be determined from decrypted data
          ) || {
            symbol: 'UNKNOWN',
            name: 'Unknown Project',
            description: 'Project details encrypted',
            location: 'Unknown',
            projectType: 'Unknown'
          };
          
          return {
            id: `ORD-${orderId.toString().padStart(3, '0')}`,
            symbol: matchingOffset.symbol,
            name: matchingOffset.name,
            orderType: 'Buy' as const, // Would be determined from decrypted data
            quantity: 0, // Would be decrypted
            price: 0, // Would be decrypted
            totalValue: 0, // Would be calculated
            status: orderInfo[2] ? 'Executed' as const : 'Pending' as const,
            timestamp: new Date(Number(orderInfo[1]) * 1000).toISOString(),
            encryptedData: {
              handles,
              proof: encryptedData[4] as string || '0x0'
            }
          };
        } catch (error) {
          console.error('❌ Failed to load order', orderId, ':', error);
          return null;
        }
      }));
      
      // Filter out failed orders
      const validOrders = ordersData.filter(order => order !== null) as Order[];
      console.log('✅ Step 2 completed: Loaded', validOrders.length, 'valid orders');
      
      setOrders(validOrders);
      console.log('🎉 Orders loaded from contract successfully!');
    } catch (error) {
      console.error('❌ Failed to load orders from contract:', error);
      console.error('📊 Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        address
      });
      
      // Set error state instead of falling back to mock data
      const errorMessage = error instanceof Error ? error.message : 'Failed to load orders from contract';
      setContractError(errorMessage);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadCarbonOffsets();
    if (isConnected && address) {
      loadOrdersFromContract();
    }
  }, [isConnected, address]);

  const handleDecryptOrder = async (orderId: string) => {
    if (!instance || !address || !signerPromise) {
      alert('FHE instance, wallet, or signer not ready');
      return;
    }

    setIsDecrypting(true);
    try {
      console.log('🚀 Starting FHE order decryption process...');
      console.log('📊 Order ID:', orderId);
      
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.encryptedData) {
        throw new Error('Order or encrypted data not found');
      }

      // Check if this is real contract data or mock data
      if (order.encryptedData.handles.length === 0 || 
          order.encryptedData.handles.every(handle => handle === '0x0' || handle === '0x0000000000000000000000000000000000000000000000000000000000000000')) {
        throw new Error('No encrypted data available for this order. This may be mock data that cannot be decrypted.');
      }

      // Check if handles look valid (should be 66 characters including 0x)
      const invalidHandles = order.encryptedData.handles.filter(handle => 
        handle.length !== 66 || !handle.startsWith('0x')
      );
      if (invalidHandles.length > 0) {
        console.warn('⚠️ Invalid handles detected:', invalidHandles);
        throw new Error('Invalid encrypted data format. Handles should be 66 characters long.');
      }

      console.log('🔄 Step 1: Preparing encrypted handles...');
      console.log('📊 Encrypted handles count:', order.encryptedData.handles.length);
      
      console.log('🔄 Step 2: Decrypting order data...');
      console.log('📊 Contract address for decryption:', CONTRACT_ADDRESS);
      const signer = await signerPromise;
      const decryptedData = await decryptVaultData(
        instance,
        order.encryptedData.handles,
        CONTRACT_ADDRESS, // Use centralized contract address
        address,
        signer
      );

      console.log('✅ Step 2 completed: Order data decrypted');
      console.log('📊 Decrypted data:', decryptedData);

      // Parse decrypted data
      const parsedData = {
        orderType: decryptedData[order.encryptedData.handles[0]]?.toString() || '1',
        quantity: decryptedData[order.encryptedData.handles[1]]?.toString() || '0',
        price: decryptedData[order.encryptedData.handles[2]]?.toString() || '0',
        symbol: decryptedData[order.encryptedData.handles[3]]?.toString() || '0'
      };

      console.log('🔄 Step 3: Parsing decrypted values...');
      console.log('📊 Parsed data:', parsedData);

      setDecryptedOrders(prev => ({
        ...prev,
        [orderId]: parsedData
      }));

      console.log('🎉 Order decryption completed successfully!');
    } catch (error) {
      console.error('❌ FHE order decryption failed:', error);
      console.error('📊 Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        orderId
      });
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.message.includes('Invalid public or private key')) {
          errorMessage = 'FHE keypair issue. This data may have been encrypted with a different keypair. Please try the "Reinitialize FHE" button.';
        } else if (error.message.includes('Data encrypted with different keypair')) {
          errorMessage = 'This data was encrypted with a different keypair. Please try the "Reinitialize FHE" button.';
        } else if (error.message.includes('No encrypted data available')) {
          errorMessage = 'This order has no encrypted data to decrypt.';
        } else if (error.message.includes('FHE SDK error')) {
          errorMessage = 'FHE SDK internal error. Please try the "Reinitialize FHE" button.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`Error decrypting order: ${errorMessage}\n\n💡 Try clicking "Reinitialize FHE" button to fix keypair issues.`);
    } finally {
      setIsDecrypting(false);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Executed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Executed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Order History
          </CardTitle>
          <CardDescription>
            Please connect your wallet to view your carbon offset order history
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (fheLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Initializing FHE Decryption
          </CardTitle>
          <CardDescription>
            Setting up privacy-preserving order decryption services...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (fheError) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <Lock className="w-5 h-5" />
            FHE Initialization Failed
          </CardTitle>
          <CardDescription>
            {fheError}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Order History</h2>
          <p className="text-muted-foreground">
            View and decrypt your carbon offset trading orders with complete privacy
          </p>
        </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={loadOrdersFromContract}
                    disabled={isLoadingOrders}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                    {isLoadingOrders ? 'Loading...' : 'Refresh Orders'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDecrypted(!showDecrypted)}
                    className="flex items-center gap-2"
                  >
                    {showDecrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showDecrypted ? 'Hide Decrypted' : 'Show Decrypted'}
                  </Button>
                </div>
      </div>

      {/* Error State */}
      {contractError && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">Contract Error</h3>
              <p className="text-red-600">{contractError}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoadingOrders && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <div>
              <h3 className="font-semibold">Loading Orders from Contract</h3>
              <p className="text-muted-foreground">Fetching your carbon offset orders...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoadingOrders && !contractError && orders.length === 0 && (
        <Card className="p-8 text-center">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
          <p className="text-muted-foreground mb-4">
            You haven't placed any carbon offset orders yet.
          </p>
          <Button onClick={() => window.location.href = '/trading'}>
            Start Trading
          </Button>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className="font-semibold text-lg">{order.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.symbol} • {order.timestamp}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{order.status}</span>
                </Badge>
                <Badge variant="outline">
                  {order.orderType}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-mono text-lg">
                  {showDecrypted ? order.quantity.toLocaleString() : '***'} tons
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-mono text-lg">
                  {showDecrypted ? `$${order.price}` : '$***'}/ton
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-mono text-lg">
                  {showDecrypted ? `$${order.totalValue.toLocaleString()}` : '$***'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
            </div>

            {decryptedOrders[order.id] && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-green-800">
                  <Unlock className="w-4 h-4 text-green-500" />
                  Decrypted Data
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Type:</span>
                    <span className="ml-2 font-mono text-green-700">{decryptedOrders[order.id].orderType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="ml-2 font-mono text-green-700">{decryptedOrders[order.id].quantity} tons</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <span className="ml-2 font-mono text-green-700">${decryptedOrders[order.id].price}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="ml-2 font-mono text-green-700">{decryptedOrders[order.id].symbol}</span>
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>🔒 All order data encrypted with FHE</span>
              </div>
              {decryptedOrders[order.id] ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDecryptedOrders(prev => {
                    const newDecrypted = { ...prev };
                    delete newDecrypted[order.id];
                    return newDecrypted;
                  })}
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Hide Decrypted
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecryptOrder(order.id)}
                  disabled={isDecrypting}
                  className="flex items-center gap-2"
                >
                  {isDecrypting ? (
                    <>
                      <Lock className="w-4 h-4 animate-spin" />
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      Decrypt Order
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trading Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Executed</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'Executed').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'Pending').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">
                ${orders.reduce((sum, order) => sum + order.totalValue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
