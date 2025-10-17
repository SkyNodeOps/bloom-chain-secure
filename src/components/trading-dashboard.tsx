import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Leaf, Lock, ArrowLeft, RefreshCw } from "lucide-react";
import carbonLogo from "@/assets/carbon-logo.png";
import { useAccount } from 'wagmi';
import { useContract } from '../lib/contract';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { encryptCarbonOrder } from '../lib/fhe-utils';

export const TradingDashboard = () => {
  const { address, isConnected } = useAccount();
  const { instance } = useZamaInstance();
  const { getCarbonOffsets, placeCarbonOrder } = useContract();
  const [carbonOffsets, setCarbonOffsets] = useState<any[]>([]);
  const [selectedOffset, setSelectedOffset] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Load carbon offsets from contract
  useEffect(() => {
    const loadCarbonOffsets = async () => {
      if (!isConnected) return;
      
      setIsLoading(true);
      try {
        console.log('🔄 Loading carbon offsets from contract...');
        const offsets = await getCarbonOffsets();
        setCarbonOffsets(offsets);
        console.log('✅ Carbon offsets loaded:', offsets.length);
      } catch (error) {
        console.error('❌ Failed to load carbon offsets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCarbonOffsets();
  }, [isConnected, getCarbonOffsets]);

  // Auto-populate max price when offset is selected
  useEffect(() => {
    if (selectedOffset && carbonOffsets.length > 0) {
      const offset = carbonOffsets.find(o => o.symbol === selectedOffset);
      if (offset) {
        setMaxPrice((offset.currentPrice / 100).toString());
      }
    }
  }, [selectedOffset, carbonOffsets]);

  const handlePlaceOrder = async () => {
    if (!instance || !selectedOffset || !amount || !maxPrice) {
      alert('Please fill in all fields');
      return;
    }

    setIsPlacingOrder(true);
    try {
      console.log('🚀 Creating FHE encrypted order...');
      
      // Encrypt order data
      const encryptedData = await encryptCarbonOrder(
        instance,
        '0x89814588d95856Db76151E3f13cC204bB9Fa5Ff5', // Contract address
        address!,
        {
          orderType: 1, // Buy
          quantity: parseInt(amount),
          price: parseFloat(maxPrice) * 100, // Convert to cents
          offsetSymbol: selectedOffset
        }
      );

      console.log('📊 Encrypted data:', encryptedData);

      // Place order on contract (encryption is handled inside the function)
      const tx = await placeCarbonOrder(
        selectedOffset,
        1, // Order type: 1 = Buy
        parseInt(amount), // Quantity
        parseFloat(maxPrice) * 100 // Price in cents
      );

      console.log('✅ Order placed successfully!', tx);
      alert('Order placed successfully! Check Order History to decrypt your order data.');
      
      // Reset form
      setSelectedOffset('');
      setAmount('');
      setMaxPrice('');
      
    } catch (error) {
      console.error('❌ Failed to place order:', error);
      alert('Failed to place order: ' + error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={carbonLogo} alt="Logo" className="w-8 h-8" />
              <span className="font-bold text-foreground">CarbonFHE</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Trading Dashboard</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitor carbon offset markets with complete privacy. All trading volumes are encrypted.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  Available Carbon Offsets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2">Loading carbon offsets...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {carbonOffsets.map((offset) => (
                      <div 
                        key={offset.symbol} 
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold text-foreground">{offset.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {offset.isVerified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Volume: *** (Encrypted)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">${(offset.currentPrice / 100).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            Supply: {offset.availableSupply} tons
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buy Offsets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Carbon Offset</label>
                  <Select value={selectedOffset} onValueChange={setSelectedOffset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {carbonOffsets.map((offset) => (
                        <SelectItem key={offset.symbol} value={offset.symbol}>
                          {offset.name} - ${(offset.currentPrice / 100).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Amount (tons CO₂)</label>
                  <Input 
                    placeholder="0.00" 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Max Price per Ton</label>
                  <Input 
                    placeholder="0.00" 
                    type="number" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  variant="hero" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !instance}
                >
                  {isPlacingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  🔒 All transaction details are encrypted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Offsets</span>
                    <span className="font-medium">*** tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Portfolio Value</span>
                    <span className="font-medium">$***</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Change</span>
                    <span className="font-medium text-primary">+***%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};