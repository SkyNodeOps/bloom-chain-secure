import { TradingDashboard } from "@/components/trading-dashboard";
import { EncryptedVaultManager } from "@/components/EncryptedVaultManager";

const Trading = () => {
  return (
    <div className="relative">
      <TradingDashboard />
      <div className="container mx-auto px-4 py-8">
        <EncryptedVaultManager />
      </div>
    </div>
  );
};

export default Trading;