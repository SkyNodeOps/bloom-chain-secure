import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Download, ExternalLink, Shield, Lock, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Demo = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Leaf className="w-8 h-8 text-primary" />
              <span className="font-bold text-foreground">Bloom Chain Secure</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/trading">
                <Button variant="outline" size="sm">
                  Start Trading
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              FHE-Encrypted Carbon Offset Trading Demo
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch our complete privacy-preserving carbon offset trading platform in action. 
              All trading data is encrypted with Fully Homomorphic Encryption (FHE) technology.
            </p>
          </div>

          {/* Video Demo */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Live Demo Video
              </CardTitle>
              <CardDescription>
                Complete workflow demonstration of FHE-encrypted carbon offset trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full object-cover"
                  poster="/carbon-trade-poster.jpg"
                >
                  <source src="/carbon-trade-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <Button asChild>
                  <a href="/carbon-trade-demo.mp4" download>
                    <Download className="w-4 h-4 mr-2" />
                    Download Demo
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://github.com/SkyNodeOps/bloom-chain-secure" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Source Code
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle>FHE Encryption</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All trading data is encrypted using Fully Homomorphic Encryption, 
                  ensuring complete privacy during processing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <CardTitle>Zero-Knowledge</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Verify transactions and orders without revealing sensitive 
                  information like quantities or prices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  <CardTitle>Carbon Trading</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trade verified carbon offset projects with complete privacy 
                  and transparency.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Technical Details */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
              <CardDescription>
                Built with cutting-edge privacy-preserving technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Frontend Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">React 18</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Vite</Badge>
                    <Badge variant="secondary">Tailwind CSS</Badge>
                    <Badge variant="secondary">shadcn/ui</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Blockchain & Privacy</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Ethereum Sepolia</Badge>
                    <Badge variant="secondary">Zama FHE SDK</Badge>
                    <Badge variant="secondary">RainbowKit</Badge>
                    <Badge variant="secondary">Wagmi</Badge>
                    <Badge variant="secondary">Hardhat</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Information */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Smart Contract Details</CardTitle>
              <CardDescription>
                Deployed and verified on Sepolia testnet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Contract Address</h4>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    0xf51CeBCa9d8C0240bEeFb4F6fFb1251d27eFE9c8
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Network</h4>
                  <Badge variant="outline">Sepolia Testnet</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Explorer</h4>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href="https://sepolia.etherscan.io/address/0xf51CeBCa9d8C0240bEeFb4F6fFb1251d27eFE9c8" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Etherscan
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Experience Privacy-Preserving Trading?</h2>
            <p className="text-muted-foreground mb-6">
              Start trading carbon offsets with complete privacy protection.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/trading">
                <Button size="lg" className="gap-2">
                  <Leaf className="w-4 h-4" />
                  Start Trading
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
