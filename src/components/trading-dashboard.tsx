import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Leaf, Lock, ArrowLeft } from "lucide-react";
import carbonLogo from "@/assets/carbon-logo.png";

export const TradingDashboard = () => {
  const mockOffsets = [
    { id: 1, project: "Amazon Reforestation", price: 12.50, change: +2.3, volume: "***", verified: true },
    { id: 2, project: "Solar Farm India", price: 8.75, change: -1.2, volume: "***", verified: true },
    { id: 3, project: "Wind Energy Brazil", price: 15.20, change: +5.1, volume: "***", verified: true },
    { id: 4, project: "Ocean Kelp Farming", price: 22.80, change: +0.8, volume: "***", verified: true },
  ];

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
                <div className="space-y-4">
                  {mockOffsets.map((offset) => (
                    <div 
                      key={offset.id} 
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-foreground">{offset.project}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {offset.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Volume: {offset.volume}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">${offset.price}</div>
                        <div className={`flex items-center gap-1 text-sm ${
                          offset.change > 0 ? 'text-primary' : 'text-destructive'
                        }`}>
                          {offset.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(offset.change)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <label className="text-sm font-medium text-foreground mb-2 block">Amount (tons CO₂)</label>
                  <Input placeholder="0.00" type="number" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Max Price per Ton</label>
                  <Input placeholder="0.00" type="number" />
                </div>
                <Button className="w-full" variant="hero" size="lg">
                  Place Order
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