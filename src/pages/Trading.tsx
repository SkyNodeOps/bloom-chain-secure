import { TradingDashboard } from "@/components/TradingDashboard";
import { OrderHistory } from "@/components/OrderHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Trading = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to Home Button */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
        <div className="h-6 w-px bg-border" />
        <h1 className="text-2xl font-bold">Carbon Offset Trading</h1>
      </div>

      <Tabs defaultValue="trading" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trading">Trading Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>
        <TabsContent value="trading">
          <TradingDashboard />
        </TabsContent>
        <TabsContent value="orders">
          <OrderHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Trading;