# 🌿 Bloom Chain Secure

> **Next-Generation Privacy-Preserving Carbon Offset Trading Platform**

A revolutionary blockchain platform that leverages cutting-edge Fully Homomorphic Encryption (FHE) technology to provide secure, private, and verifiable carbon offset trading. Built for the future of sustainable finance with complete privacy protection.

## 🎥 Demo Video

[![Carbon Trade Demo](https://img.shields.io/badge/🎥-Watch%20Demo-blue?style=for-the-badge)](https://github.com/SkyNodeOps/bloom-chain-secure/raw/main/public/carbon-trade-demo.mp4)

*Watch the complete FHE-encrypted carbon offset trading workflow in action*

> **📹 Demo Features**: 
> - Complete FHE encryption workflow
> - Carbon offset order creation
> - Real-time market data display
> - Order history decryption
> - Privacy-preserving trading interface

**Download Demo Video**: [carbon-trade-demo.mp4](https://github.com/SkyNodeOps/bloom-chain-secure/raw/main/public/carbon-trade-demo.mp4) (6.6MB)

## 🚀 Key Features

### 🔐 **Privacy-First Architecture**
- **FHE-Encrypted Trading**: All order data remains encrypted during processing
- **Zero-Knowledge Proofs**: Verify transactions without revealing sensitive information
- **Complete Data Privacy**: Order quantities, prices, and symbols are never exposed

### 💼 **Carbon Offset Trading**
- **Real-Time Market Data**: Live carbon offset prices and availability
- **Secure Order Placement**: FHE-encrypted buy/sell orders
- **Portfolio Management**: Private portfolio tracking and analytics
- **Order History**: Decrypt and view your trading history with full privacy

### 🌱 **Supported Carbon Projects**
- **AMAZON**: Amazon Reforestation Projects
- **SOLAR**: Solar Farm India Initiatives  
- **WIND**: Wind Energy Brazil Projects
- **OCEAN**: Ocean Kelp Farming Solutions

### 🛡️ **Advanced Security**
- **ACL Permissions**: Fine-grained access control for encrypted data
- **EIP712 Signatures**: Secure decryption authorization
- **Smart Contract Integration**: On-chain encrypted data storage

## 🏗️ Technical Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + TypeScript + Vite | Modern, performant development experience |
| **UI Framework** | Tailwind CSS + shadcn/ui | Beautiful, accessible component library |
| **Blockchain** | Ethereum Sepolia + FHE (Zama Network) | Privacy-preserving smart contracts |
| **Wallet Integration** | RainbowKit + Wagmi + Viem | Universal wallet connectivity |
| **Encryption** | Zama FHE SDK + Solidity Libraries | Zero-knowledge data processing |
| **Build System** | Vite + npm | Optimized production builds |

## 🎯 Quick Start Guide

### Prerequisites

- **Node.js** v18+ (LTS recommended)
- **Package Manager** npm/yarn/pnpm
- **Git** for version control
- **Web3 Wallet** (MetaMask, Rainbow, etc.)
- **Test ETH** on Sepolia network

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/SkyNodeOps/bloom-chain-secure.git
cd bloom-chain-secure
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**

Create a `.env` file in the root directory:

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY

# Wallet Connect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID

# Optional: Infura Configuration
NEXT_PUBLIC_INFURA_API_KEY=YOUR_INFURA_API_KEY
```

4. **Start development server**
```bash
npm run dev
```

Navigate to `http://localhost:8080` in your browser.

## 🔧 Smart Contract Development

### Contract Information
- **Contract Address**: `0xf51CeBCa9d8C0240bEeFb4F6fFb1251d27eFE9c8`
- **Network**: Sepolia Testnet
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0xf51CeBCa9d8C0240bEeFb4F6fFb1251d27eFE9c8)

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm run test
```

### Deploy to Sepolia
```bash
npm run deploy
```

## 📁 Project Structure

```
bloom-chain-secure/
├── contracts/              # Smart contracts
│   └── BloomChainSecure.sol
├── scripts/                # Deployment scripts
│   └── deploy.cjs
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── TradingDashboard.tsx
│   │   ├── OrderHistory.tsx
│   │   └── EncryptedVaultManager.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useZamaInstance.ts
│   │   └── useEthersSigner.ts
│   ├── lib/               # Utility functions
│   │   ├── contract.ts    # Contract interactions
│   │   ├── fhe-utils.ts   # FHE utilities
│   │   └── utils.ts
│   ├── config/            # Configuration files
│   │   └── contracts.ts   # Contract addresses
│   ├── pages/             # Page components
│   │   ├── Index.tsx      # Home page
│   │   └── Trading.tsx    # Trading page
│   ├── App.tsx            # Main application
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── hardhat.config.cjs     # Hardhat configuration
└── package.json
```

## 🔐 Security & Privacy Architecture

### FHE Integration
- **Encrypted Data Processing**: All sensitive operations use FHE
- **Zero-Knowledge Proofs**: Verify operations without revealing data
- **Privacy-Preserving Analytics**: Analytics without data exposure
- **ACL Permissions**: Granular access control for encrypted fields

### Smart Contract Security
- **Access Control**: Role-based permissions
- **Encrypted Storage**: Sensitive data encrypted on-chain
- **Event Logging**: Comprehensive audit trails
- **Carbon Offset Management**: Secure project data storage

### Carbon Trading Features
- **Order Encryption**: All order data encrypted with FHE
- **Price Privacy**: Trading prices remain confidential
- **Quantity Protection**: Order quantities encrypted
- **Symbol Security**: Project symbols protected

## 🚀 Deployment Guide

### Vercel Deployment

1. **Connect to Vercel**
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Environment Variables**
   - Add all environment variables from `.env` file
   - Ensure `NEXT_PUBLIC_` prefix for client-side variables

3. **Build Settings**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy**
   - Click "Deploy" to start the deployment process
   - Wait for build completion
   - Access your deployed application

## 📊 Performance Metrics

### Encryption Performance
- **Order Encryption**: < 2 seconds
- **Data Decryption**: < 3 seconds
- **Contract Interaction**: < 5 seconds
- **FHE Initialization**: < 1 second

### Supported Operations
- ✅ Carbon offset order creation
- ✅ Real-time market data
- ✅ Portfolio tracking
- ✅ Order history decryption
- ✅ Price privacy protection

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Ensure FHE compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [Project Wiki](https://github.com/SkyNodeOps/bloom-chain-secure/wiki)
- **Demo**: [Live Demo](https://bloom-chain-secure.vercel.app)
- **GitHub**: [Repository](https://github.com/SkyNodeOps/bloom-chain-secure)
- **Contract**: [Etherscan](https://sepolia.etherscan.io/address/0xf51CeBCa9d8C0240bEeFb4F6fFb1251d27eFE9c8)

## 🙏 Acknowledgments

- **Zama Network** for FHE technology and SDK
- **RainbowKit** for wallet integration
- **shadcn/ui** for beautiful components
- **Vite** for fast development experience
- **Ethereum Foundation** for blockchain infrastructure

## 📞 Support

For support, email tech05@infinia.fit or join our Discord community.

## 🌟 Features in Detail

### Trading Dashboard
- **Real-time Market Data**: Live carbon offset prices
- **Auto-price Population**: Automatic price filling based on selected project
- **Secure Order Placement**: FHE-encrypted order submission
- **Portfolio Overview**: Private portfolio tracking

### Order History
- **Encrypted Data Storage**: All orders stored with FHE encryption
- **Decryption Capability**: View your orders with proper authorization
- **Order Management**: Track order status and execution
- **Privacy Protection**: Complete data privacy throughout the process

### Carbon Offset Projects
- **Verified Projects**: Only verified carbon offset projects
- **Real-time Pricing**: Live market prices for all projects
- **Supply Tracking**: Available supply monitoring
- **Project Details**: Comprehensive project information

---

**Built with ❤️ by SkyNodeOps**

*Empowering sustainable finance through privacy-preserving blockchain technology*