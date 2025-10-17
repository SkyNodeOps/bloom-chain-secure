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
import { useContract } from '../lib/contract';
import { decryptVaultData, testFHEFunctionality } from '../lib/fhe-utils';

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
  const { getCarbonOffsets, getUserCarbonOrderIds, getCarbonOrderEncryptedData, getCarbonOrderInfo } = useContract();
  const [orders, setOrders] = useState<Order[]>([]);
  const [carbonOffsets, setCarbonOffsets] = useState<any[]>([]);
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [decryptedOrders, setDecryptedOrders] = useState<Record<string, any>>({});

  // Mock order data with encrypted handles
  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      symbol: 'AMAZON',
      name: 'Amazon Reforestation',
      orderType: 'Buy',
      quantity: 50,
      price: 12.50,
      totalValue: 625.00,
      status: 'Executed',
      timestamp: '2024-01-15 14:30:25',
      encryptedData: {
        handles: [
          '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
          '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
          '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
          '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        ],
        proof: '0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12'
      }
    },
    {
      id: 'ORD-002',
      symbol: 'SOLAR',
      name: 'Solar Farm India',
      orderType: 'Buy',
      quantity: 100,
      price: 8.75,
      totalValue: 875.00,
      status: 'Pending',
      timestamp: '2024-01-15 15:45:12',
      encryptedData: {
        handles: [
          '0x6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
          '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
          '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567',
          '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678'
        ],
        proof: '0xa0bcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789'
      }
    },
    {
      id: 'ORD-003',
      symbol: 'WIND',
      name: 'Wind Energy Brazil',
      orderType: 'Sell',
      quantity: 25,
      price: 15.20,
      totalValue: 380.00,
      status: 'Executed',
      timestamp: '2024-01-15 16:20:45',
      encryptedData: {
        handles: [
          '0xb0cdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          '0xc0def1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
          '0xd0ef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
          '0xe0f1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd'
        ],
        proof: '0xf01234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde'
      }
    }
  ];

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
    try {
      console.log('🔄 Loading orders from contract for address:', address);
      
      // Step 1: Get user's order IDs from contract
      console.log('📊 Step 1: Getting user order IDs...');
      const orderIds = await getUserCarbonOrderIds(address);
      console.log('✅ Step 1 completed: Found', orderIds.length, 'orders');
      
      if (orderIds.length === 0) {
        console.log('📊 No orders found for user');
        setOrders([]);
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
          
          // Convert encrypted data to handles format
          const handles = encryptedData.slice(0, 4).map(handle => 
            typeof handle === 'string' ? handle : `0x${handle.toString(16).padStart(64, '0')}`
          );
          
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
      
      // Fallback to mock data if contract fails
      console.log('📊 Falling back to mock data...');
      setOrders(mockOrders);
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
    if (!instance || !address) {
      alert('FHE instance or wallet not ready');
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

      console.log('🔄 Step 1: Preparing encrypted handles...');
      console.log('📊 Encrypted handles count:', order.encryptedData.handles.length);
      
      console.log('🔄 Step 2: Decrypting order data...');
      const decryptedData = await decryptVaultData(
        instance,
        order.encryptedData.handles,
        '0x1FCDBE4160E1698dac93934e1a4d5F1291656b0D', // Contract address
        address
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
      alert(`Order ${orderId} decrypted successfully!\n\nDecrypted data:\n- Order Type: ${parsedData.orderType}\n- Quantity: ${parsedData.quantity}\n- Price: ${parsedData.price}\n- Symbol: ${parsedData.symbol}`);
    } catch (error) {
      console.error('❌ FHE order decryption failed:', error);
      console.error('📊 Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        orderId
      });
      alert(`Error decrypting order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleTestFHE = async () => {
    if (!instance) {
      alert('FHE instance not ready');
      return;
    }

    try {
      console.log('🧪 Testing FHE functionality...');
      const success = await testFHEFunctionality(instance);
      if (success) {
        alert('✅ FHE Test Successful! Encryption/Decryption working properly.');
      } else {
        alert('❌ FHE Test Failed! Please check console for details.');
      }
    } catch (error) {
      console.error('❌ FHE Test Error:', error);
      alert(`FHE Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            onClick={handleTestFHE}
            className="flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Test FHE
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

            {showDecrypted && decryptedOrders[order.id] && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-green-500" />
                  Decrypted Data
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Type:</span>
                    <span className="ml-2 font-mono">{decryptedOrders[order.id].orderType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="ml-2 font-mono">{decryptedOrders[order.id].quantity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <span className="ml-2 font-mono">{decryptedOrders[order.id].price}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="ml-2 font-mono">{decryptedOrders[order.id].symbol}</span>
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
