import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Shield, Leaf } from 'lucide-react';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isTradingPage = location.pathname === '/trading';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              <Leaf className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bloom Chain Secure</h1>
              <p className="text-sm text-muted-foreground">Carbon Offset Trading Platform</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            {!isHomePage && (
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            )}
            
            {isTradingPage && (
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}

            {isHomePage && (
              <Button
                onClick={() => navigate('/trading')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Leaf className="w-4 h-4" />
                Start Trading
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
