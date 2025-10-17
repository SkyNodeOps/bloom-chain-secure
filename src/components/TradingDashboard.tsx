import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Leaf, 
  Globe, 
  Zap,
  Waves,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useContract } from '../lib/contract';
import { encryptCarbonOrder, testFHEFunctionality } from '../lib/fhe-utils';
import { useWriteContract } from 'wagmi';

interface CarbonOffset {
  symbol: string;
  name: string;
  description: string;
  location: string;
  projectType: string;
  currentPrice: number;
  totalSupply: number;
  availableSupply: number;
  isVerified: boolean;
  isActive: boolean;
}

interface Portfolio {
  totalOffsets: number;
  portfolioValue: number;
  totalPnl: number;
  tradeCount: number;
}

export const TradingDashboard = () => {
  const { address, isConnected } = useAccount();
  const { instance, isLoading: fheLoading, error: fheError } = useZamaInstance();
  const { writeContractAsync } = useWriteContract();
  const [carbonOffsets, setCarbonOffsets] = useState<CarbonOffset[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalOffsets: 0,
    portfolioValue: 0,
    totalPnl: 0,
    tradeCount: 0
  });
  const [selectedOffset, setSelectedOffset] = useState<string>('');
  const [orderAmount, setOrderAmount] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEncrypted, setShowEncrypted] = useState(false);

  // Mock data for demonstration
  const mockOffsets: CarbonOffset[] = [
    {
      symbol: "AMAZON",
      name: "Amazon Reforestation",
      description: "Large-scale reforestation project in the Amazon rainforest",
      location: "Brazil",
      projectType: "Reforestation",
      currentPrice: 12.50,
      totalSupply: 10000,
      availableSupply: 8500,
      isVerified: true,
      isActive: true
    },
    {
      symbol: "SOLAR",
      name: "Solar Farm India",
      description: "Renewable solar energy project in India",
      location: "India",
      projectType: "Solar",
      currentPrice: 8.75,
      totalSupply: 15000,
      availableSupply: 12000,
      isVerified: true,
      isActive: true
    },
    {
      symbol: "WIND",
      name: "Wind Energy Brazil",
      description: "Wind farm project in Brazil",
      location: "Brazil",
      projectType: "Wind",
      currentPrice: 15.20,
      totalSupply: 8000,
      availableSupply: 6500,
      isVerified: true,
      isActive: true
    },
    {
      symbol: "OCEAN",
      name: "Ocean Kelp Farming",
      description: "Ocean kelp farming for carbon sequestration",
      location: "Pacific Ocean",
      projectType: "Ocean",
      currentPrice: 22.80,
      totalSupply: 5000,
      availableSupply: 4200,
      isVerified: true,
      isActive: true
    }
  ];

  const mockPortfolio: Portfolio = {
    totalOffsets: 1250,
    portfolioValue: 18750,
    totalPnl: 1250,
    tradeCount: 8
  };

  useEffect(() => {
    setCarbonOffsets(mockOffsets);
    setPortfolio(mockPortfolio);
  }, []);

  // Auto-fill max price when offset is selected
  useEffect(() => {
    if (selectedOffset) {
      const selectedOffsetData = carbonOffsets.find(offset => offset.symbol === selectedOffset);
      if (selectedOffsetData) {
        setMaxPrice(selectedOffsetData.currentPrice.toString());
      }
    }
  }, [selectedOffset, carbonOffsets]);

  const getProjectIcon = (projectType: string) => {
    switch (projectType) {
      case 'Reforestation':
        return <Leaf className="w-5 h-5 text-green-500" />;
      case 'Solar':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'Wind':
        return <Globe className="w-5 h-5 text-blue-500" />;
      case 'Ocean':
        return <Waves className="w-5 h-5 text-cyan-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriceChange = (symbol: string) => {
    // Mock price changes
    const changes: { [key: string]: number } = {
      'AMAZON': 2.3,
      'SOLAR': 1.2,
      'WIND': 5.1,
      'OCEAN': 0.8
    };
    return changes[symbol] || 0;
  };

  const handlePlaceOrder = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!instance) {
      alert('FHE encryption service not ready');
      return;
    }

    if (!selectedOffset || !orderAmount || !maxPrice) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Starting carbon offset order placement...');
      console.log('📊 Order details:', {
        symbol: selectedOffset,
        amount: orderAmount,
        maxPrice: maxPrice,
        userAddress: address
      });

      // Get the selected offset data
      const selectedOffsetData = carbonOffsets.find(offset => offset.symbol === selectedOffset);
      if (!selectedOffsetData) {
        throw new Error('Selected offset not found');
      }

      // Prepare order data for FHE encryption
      const orderData = {
        orderType: 1, // Buy order
        quantity: parseFloat(orderAmount),
        price: parseFloat(maxPrice),
        offsetSymbol: selectedOffset
      };

      console.log('🔄 Step 1: Encrypting order data with FHE...');
      const encryptedData = await encryptCarbonOrder(
        instance,
        '0x20939C157bfC2F264595CeD2a58bE375bdB15616', // Contract address
        address!,
        orderData
      );

      console.log('✅ Step 1 completed: Order data encrypted successfully');
      console.log('📊 Encrypted handles:', encryptedData.handles.length);

      // Call the actual contract function
      console.log('🔄 Step 2: Calling smart contract...');
      console.log('📊 Contract address:', '0x1FCDBE4160E1698dac93934e1a4d5F1291656b0D');
      console.log('📊 Function: placeCarbonOrder');
      console.log('📊 Args:', {
        symbol: selectedOffset,
        orderType: encryptedData.handles[0],
        quantity: encryptedData.handles[1],
        price: encryptedData.handles[2],
        proof: encryptedData.proof
      });

      const tx = await writeContractAsync({
        address: '0x20939C157bfC2F264595CeD2a58bE375bdB15616' as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"internalType": "string", "name": "_symbol", "type": "string"},
              {"internalType": "bytes32", "name": "_orderType", "type": "bytes32"},
              {"internalType": "bytes32", "name": "_quantity", "type": "bytes32"},
              {"internalType": "bytes32", "name": "_price", "type": "bytes32"},
              {"internalType": "bytes", "name": "_inputProof", "type": "bytes"}
            ],
            "name": "placeCarbonOrder",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'placeCarbonOrder',
        args: [
          selectedOffset,
          encryptedData.handles[0] as `0x${string}`,
          encryptedData.handles[1] as `0x${string}`,
          encryptedData.handles[2] as `0x${string}`,
          encryptedData.proof as `0x${string}`
        ],
      });

      console.log('✅ Step 2 completed: Transaction submitted');
      console.log('📊 Transaction hash:', tx);
      console.log('🎉 Carbon offset order submitted to blockchain!');
      
      alert(`Order placed successfully!\n\n${selectedOffsetData.name}\n${orderAmount} tons at $${maxPrice}/ton\n\n🔒 All data encrypted with FHE\n\n📊 Transaction: ${tx}\n🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${tx}`);
      setOrderAmount('');
      setMaxPrice('');
      setSelectedOffset('');
    } catch (error) {
      console.error('❌ Error placing carbon offset order:', error);
      console.error('📊 Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        selectedOffset,
        orderAmount,
        maxPrice
      });
      alert(`Error placing order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Wallet Required
          </CardTitle>
          <CardDescription>
            Please connect your wallet to access carbon offset trading
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (fheLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Initializing FHE Encryption
          </CardTitle>
          <CardDescription>
            Setting up privacy-preserving trading services...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (fheError) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <Shield className="w-5 h-5" />
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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Carbon Offset Trading Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor carbon offset markets with complete privacy. All trading volumes are encrypted.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Lock className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">🔒 All transaction details are encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Carbon Offsets */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Available Carbon Offsets
              </CardTitle>
              <CardDescription>
                Trade verified carbon offset projects with complete privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carbonOffsets.map((offset) => (
                <Card key={offset.symbol} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getProjectIcon(offset.projectType)}
                      <div>
                        <h3 className="font-semibold">{offset.name}</h3>
                        <p className="text-sm text-muted-foreground">{offset.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        Verified
                      </Badge>
                      {offset.isVerified && <Shield className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-mono text-lg">
                        {showEncrypted ? '***' : `${offset.availableSupply.toLocaleString()} tons`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-mono text-lg">${offset.currentPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">24h Change</p>
                      <div className="flex items-center gap-1">
                        {getPriceChange(offset.symbol) >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`font-mono ${
                          getPriceChange(offset.symbol) >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {getPriceChange(offset.symbol) >= 0 ? '+' : ''}{getPriceChange(offset.symbol)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{offset.description}</p>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          {/* Buy Offsets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Buy Offsets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="offset-select">Select Carbon Offset</Label>
                <select
                  id="offset-select"
                  value={selectedOffset}
                  onChange={(e) => setSelectedOffset(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose an offset...</option>
                  {carbonOffsets.map((offset) => (
                    <option key={offset.symbol} value={offset.symbol}>
                      {offset.name} - ${offset.currentPrice}/ton
                    </option>
                  ))}
                </select>
                {selectedOffset && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    {(() => {
                      const selected = carbonOffsets.find(offset => offset.symbol === selectedOffset);
                      return selected ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getProjectIcon(selected.projectType)}
                            <span className="font-medium">{selected.name}</span>
                            <Badge variant="outline" className="text-green-600">
                              Verified
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{selected.description}</p>
                          <p className="text-sm text-muted-foreground">
                            📍 {selected.location} • 💰 ${selected.currentPrice}/ton • 📊 {selected.availableSupply.toLocaleString()} tons available
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (tons CO₂)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label htmlFor="max-price">Max Price per Ton</Label>
                <Input
                  id="max-price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
                {selectedOffset && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Current market price: ${carbonOffsets.find(offset => offset.symbol === selectedOffset)?.currentPrice || '0'}/ton
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handlePlaceOrder}
                disabled={isLoading || !selectedOffset || !orderAmount || !maxPrice}
                className="w-full"
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Portfolio
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEncrypted(!showEncrypted)}
                  className="ml-auto"
                >
                  {showEncrypted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Offsets</p>
                <p className="font-mono text-2xl">
                  {showEncrypted ? '***' : `${portfolio.totalOffsets.toLocaleString()}`} tons
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="font-mono text-2xl">
                  {showEncrypted ? '$***' : `$${portfolio.portfolioValue.toLocaleString()}`}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">24h Change</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-mono text-xl text-green-500">
                    {showEncrypted ? '+***%' : `+${((portfolio.totalPnl / portfolio.portfolioValue) * 100).toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
