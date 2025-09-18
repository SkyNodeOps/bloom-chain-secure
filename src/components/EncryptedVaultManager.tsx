import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, AlertTriangle, TrendingUp, Wallet } from 'lucide-react';
import { fheUtils } from '@/lib/fhe-utils';
import { useAccount } from 'wagmi';

export const EncryptedVaultManager = () => {
  const { address, isConnected } = useAccount();
  const [vaultName, setVaultName] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedVault, setSelectedVault] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<string>('');

  // Mock vault data
  const [vaults] = useState([
    { id: 1, name: 'Secure Vault #1', balance: '1000', riskScore: 'LOW' },
    { id: 2, name: 'High Security Vault', balance: '5000', riskScore: 'MEDIUM' },
    { id: 3, name: 'Private Fund', balance: '2500', riskScore: 'LOW' }
  ]);

  const handleCreateVault = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await fheUtils.createEncryptedVault(
        '0x...', // Contract address
        vaultName,
        vaultDescription,
        50 // Initial risk score
      );

      if (result.success) {
        setLastTransaction(result.txHash || '');
        alert(`Vault created successfully! Transaction: ${result.txHash}`);
        setVaultName('');
        setVaultDescription('');
      } else {
        alert('Failed to create vault');
      }
    } catch (error) {
      console.error('Error creating vault:', error);
      alert('Error creating vault');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!isConnected || !selectedVault) {
      alert('Please connect wallet and select a vault');
      return;
    }

    setIsLoading(true);
    try {
      const result = await fheUtils.depositEncryptedFunds(
        '0x...', // Contract address
        selectedVault,
        parseFloat(depositAmount)
      );

      if (result.success) {
        setLastTransaction(result.txHash || '');
        alert(`Deposit successful! Transaction: ${result.txHash}`);
        setDepositAmount('');
      } else {
        alert('Failed to deposit funds');
      }
    } catch (error) {
      console.error('Error depositing:', error);
      alert('Error depositing funds');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !selectedVault) {
      alert('Please connect wallet and select a vault');
      return;
    }

    setIsLoading(true);
    try {
      const result = await fheUtils.withdrawEncryptedFunds(
        '0x...', // Contract address
        selectedVault,
        parseFloat(withdrawAmount)
      );

      if (result.success) {
        setLastTransaction(result.txHash || '');
        alert(`Withdrawal successful! Transaction: ${result.txHash}`);
        setWithdrawAmount('');
      } else {
        alert('Failed to withdraw funds');
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Error withdrawing funds');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityAlert = async () => {
    if (!isConnected || !selectedVault) {
      alert('Please connect wallet and select a vault');
      return;
    }

    setIsLoading(true);
    try {
      const result = await fheUtils.reportSecurityAlert(
        '0x...', // Contract address
        selectedVault,
        'SUSPICIOUS_ACTIVITY',
        'Unusual transaction pattern detected',
        8 // High severity
      );

      if (result.success) {
        setLastTransaction(result.txHash || '');
        alert(`Security alert reported! Transaction: ${result.txHash}`);
      } else {
        alert('Failed to report security alert');
      }
    } catch (error) {
      console.error('Error reporting alert:', error);
      alert('Error reporting security alert');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Required
          </CardTitle>
          <CardDescription>
            Please connect your wallet to access encrypted vault management
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Encrypted Vault Management</h2>
        <p className="text-muted-foreground">
          Manage your privacy-preserving blockchain vaults with FHE encryption
        </p>
        {lastTransaction && (
          <Badge variant="outline" className="mt-2">
            Last TX: {lastTransaction.slice(0, 10)}...
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Vault */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Create Encrypted Vault
            </CardTitle>
            <CardDescription>
              Create a new vault with encrypted data storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vaultName">Vault Name</Label>
              <Input
                id="vaultName"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
                placeholder="Enter vault name"
              />
            </div>
            <div>
              <Label htmlFor="vaultDescription">Description</Label>
              <Textarea
                id="vaultDescription"
                value={vaultDescription}
                onChange={(e) => setVaultDescription(e.target.value)}
                placeholder="Enter vault description"
              />
            </div>
            <Button 
              onClick={handleCreateVault} 
              disabled={isLoading || !vaultName}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Encrypted Vault'}
            </Button>
          </CardContent>
        </Card>

        {/* Vault Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Vault Operations
            </CardTitle>
            <CardDescription>
              Deposit and withdraw encrypted funds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Vault</Label>
              <div className="grid grid-cols-1 gap-2">
                {vaults.map((vault) => (
                  <Button
                    key={vault.id}
                    variant={selectedVault === vault.id ? "default" : "outline"}
                    onClick={() => setSelectedVault(vault.id)}
                    className="justify-start"
                  >
                    {vault.name} - {vault.balance} ETH
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="depositAmount">Deposit Amount</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                />
                <Button 
                  onClick={handleDeposit} 
                  disabled={isLoading || !depositAmount || !selectedVault}
                  className="w-full mt-2"
                >
                  Deposit
                </Button>
              </div>
              
              <div>
                <Label htmlFor="withdrawAmount">Withdraw Amount</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0"
                />
                <Button 
                  onClick={handleWithdraw} 
                  disabled={isLoading || !withdrawAmount || !selectedVault}
                  variant="outline"
                  className="w-full mt-2"
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Security Operations
          </CardTitle>
          <CardDescription>
            Manage security metrics and report alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleSecurityAlert}
              disabled={isLoading || !selectedVault}
              variant="destructive"
            >
              Report Security Alert
            </Button>
            
            <Button 
              onClick={() => fheUtils.updateSecurityMetrics('0x...', selectedVault || 1, 75, 85)}
              disabled={isLoading || !selectedVault}
              variant="outline"
            >
              Update Security Metrics
            </Button>
            
            <Button 
              onClick={() => fheUtils.generateSecurityScore('75', '10', '2')}
              disabled={isLoading}
              variant="secondary"
            >
              Generate Security Score
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vault List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Encrypted Vaults
          </CardTitle>
          <CardDescription>
            View and manage your privacy-preserving vaults
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vaults.map((vault) => (
              <Card key={vault.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{vault.name}</h3>
                  <Badge variant={vault.riskScore === 'LOW' ? 'default' : 'secondary'}>
                    {vault.riskScore}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Balance: {vault.balance} ETH
                </p>
                <p className="text-xs text-muted-foreground">
                  All data encrypted with FHE
                </p>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
