import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WalletConnect } from "@/components/ui/wallet-connect";
import { Link } from "react-router-dom";
import { Shield, TreePine, BarChart3, Lock } from "lucide-react";
import carbonLogo from "@/assets/carbon-logo.png";

export const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-forest flex flex-col items-center justify-center px-4 text-center relative">
      {/* Logo and branding */}
      <div className="mb-8 animate-float">
        <img 
          src={carbonLogo} 
          alt="Carbon Marketplace Logo" 
          className="w-20 h-20 mx-auto mb-4 animate-glow"
        />
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
          Trade Carbon Privately,
        </h1>
        <h2 className="text-3xl md:text-5xl font-light text-white/90 mb-6">
          Backed by FHE
        </h2>
      </div>

      {/* Description */}
      <p className="text-xl text-white/80 max-w-2xl mb-8 leading-relaxed">
        The world's first confidential carbon offset marketplace. 
        Trade with encrypted volumes and private transactions powered by 
        Fully Homomorphic Encryption.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <WalletConnect />
        <Link to="/trading">
          <Button variant="hero" size="lg">
            Start Trading
          </Button>
        </Link>
        <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
          Learn More
        </Button>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <Card className="bg-white/10 border-white/20 p-6 backdrop-blur-sm">
          <Shield className="w-8 h-8 text-white mb-4 mx-auto" />
          <h3 className="text-white font-semibold mb-2">Privacy First</h3>
          <p className="text-white/70 text-sm">All transactions are encrypted using advanced FHE technology</p>
        </Card>
        
        <Card className="bg-white/10 border-white/20 p-6 backdrop-blur-sm">
          <TreePine className="w-8 h-8 text-white mb-4 mx-auto" />
          <h3 className="text-white font-semibold mb-2">Verified Offsets</h3>
          <p className="text-white/70 text-sm">Only certified carbon credits from verified projects</p>
        </Card>
        
        <Card className="bg-white/10 border-white/20 p-6 backdrop-blur-sm">
          <BarChart3 className="w-8 h-8 text-white mb-4 mx-auto" />
          <h3 className="text-white font-semibold mb-2">Real-time Trading</h3>
          <p className="text-white/70 text-sm">Instant settlement with transparent market data</p>
        </Card>
      </div>
    </div>
  );
};