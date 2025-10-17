// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint64, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BloomChainSecure
 * @dev A privacy-preserving blockchain security platform using FHE encryption
 */
contract BloomChainSecure is SepoliaConfig, Ownable {
    using FHE for euint32;
    using FHE for euint64;
    using FHE for ebool;

    // Error definitions
    error InvalidVaultId();
    error UnauthorizedAccess();
    error VaultNotActive();
    error InsufficientBalance();
    error InvalidAmount();

    // Events
    event VaultCreated(uint256 indexed vaultId, address indexed owner, string name);
    event VaultDeposited(uint256 indexed vaultId, address indexed user, uint32 amount);
    event VaultWithdrawn(uint256 indexed vaultId, address indexed user, uint32 amount);
    event SecurityAlert(uint256 indexed vaultId, string alertType, string message);
    event AnalyticsUpdated(uint256 indexed vaultId, uint32 totalValue, uint32 riskScore);
    
    // Carbon trading events
    event CarbonOffsetCreated(string indexed symbol, string name, uint256 price, uint256 supply);
    event CarbonOrderPlaced(uint256 indexed orderId, address indexed trader, string symbol, uint256 quantity, uint256 price);
    event CarbonOrderExecuted(uint256 indexed orderId, address indexed trader, string symbol, uint256 quantity, uint256 price);
    event CarbonPortfolioUpdated(address indexed trader, uint256 totalOffsets, uint256 portfolioValue);

    // Carbon Offset structure
    struct CarbonOffset {
        string symbol;
        string name;
        string description;
        string location;
        string projectType; // "Reforestation", "Solar", "Wind", "Ocean"
        uint256 currentPrice; // Price per ton CO2
        uint256 totalSupply; // Total available tons
        uint256 availableSupply; // Remaining tons
        bool isVerified;
        bool isActive;
        uint256 createdAt;
    }
    
    // Encrypted trading order structure
    struct CarbonOrder {
        address trader;
        euint32 orderId;
        euint32 orderType; // 1: Buy, 2: Sell
        euint32 quantity; // Tons of CO2
        euint32 price; // Price per ton * 100
        euint32 offsetSymbol; // Offset symbol numeric representation
        ebool isExecuted;
        uint256 timestamp;
    }
    
    // Encrypted portfolio structure
    struct CarbonPortfolio {
        address owner;
        euint64 totalOffsets; // Total tons of CO2 offsets
        euint64 portfolioValue; // Total portfolio value
        euint64 totalPnl; // Total profit/loss
        euint32 tradeCount; // Number of trades
        mapping(string => uint256) holdings; // Plaintext holdings by symbol
    }
    
    // Structs for encrypted data
    struct SecureVault {
        euint32 vaultId;
        euint32 totalDeposits;
        euint32 totalWithdrawals;
        euint32 balance;
        euint32 riskScore;
        euint32 transactionCount;
        ebool isActive;
        ebool isLocked;
        string name;
        string description;
        address owner;
        uint256 createdAt;
        uint256 lastActivity;
    }

    struct EncryptedTransaction {
        euint32 transactionId;
        euint32 amount;
        euint32 timestamp;
        ebool isDeposit;
        address user;
        uint256 blockNumber;
    }

    struct SecurityMetrics {
        euint32 totalAlerts;
        euint32 highRiskTransactions;
        euint32 suspiciousActivity;
        euint32 securityScore;
        uint256 lastUpdate;
    }

    // State variables
    mapping(uint256 => SecureVault) public vaults;
    mapping(uint256 => EncryptedTransaction) public transactions;
    mapping(uint256 => SecurityMetrics) public securityMetrics;
    mapping(address => euint32) public userReputation;
    mapping(address => uint256[]) public userVaults;
    
    // Carbon trading state variables
    mapping(string => CarbonOffset) public carbonOffsets;
    mapping(uint256 => CarbonOrder) public carbonOrders;
    mapping(address => CarbonPortfolio) public carbonPortfolios;
    string[] public offsetSymbols;
    uint256 public orderCounter;
    
    uint256 public vaultCounter;
    uint256 public transactionCounter;
    address public securityOracle;
    
    // Access control
    mapping(address => bool) public authorizedOperators;
    mapping(address => bool) public securityAdmins;

    constructor(address _securityOracle) Ownable(msg.sender) {
        securityOracle = _securityOracle;
        authorizedOperators[msg.sender] = true;
        securityAdmins[msg.sender] = true;
    }

    /**
     * @dev Create a new secure vault with FHE encryption
     */
    function createVault(
        string memory _name,
        string memory _description,
        externalEuint32 _initialRiskScore,
        bytes calldata _inputProof
    ) external returns (uint256) {
        uint256 vaultId = vaultCounter++;
        
        // Convert external encrypted data to internal
        euint32 internalRiskScore = FHE.fromExternal(_initialRiskScore, _inputProof);
        
        vaults[vaultId] = SecureVault({
            vaultId: FHE.asEuint32(uint32(vaultId)),
            totalDeposits: FHE.asEuint32(0),
            totalWithdrawals: FHE.asEuint32(0),
            balance: FHE.asEuint32(0),
            riskScore: internalRiskScore,
            transactionCount: FHE.asEuint32(0),
            isActive: FHE.asEbool(true),
            isLocked: FHE.asEbool(false),
            name: _name,
            description: _description,
            owner: msg.sender,
            createdAt: block.timestamp,
            lastActivity: block.timestamp
        });

        userVaults[msg.sender].push(vaultId);
        
        // Initialize security metrics
        securityMetrics[vaultId] = SecurityMetrics({
            totalAlerts: FHE.asEuint32(0),
            highRiskTransactions: FHE.asEuint32(0),
            suspiciousActivity: FHE.asEuint32(0),
            securityScore: FHE.asEuint32(100), // Start with perfect score
            lastUpdate: block.timestamp
        });

        emit VaultCreated(vaultId, msg.sender, _name);
        return vaultId;
    }

    /**
     * @dev Deposit funds into a vault with encrypted amount
     */
    function depositToVault(
        uint256 _vaultId,
        externalEuint32 _amount,
        bytes calldata _inputProof
    ) external payable returns (uint256) {
        require(vaults[_vaultId].owner != address(0), "Vault does not exist");
        require(msg.value > 0, "Must send ETH");
        
        // Convert external encrypted amount to internal
        euint32 internalAmount = FHE.fromExternal(_amount, _inputProof);
        
        uint256 transactionId = transactionCounter++;
        
        // Create encrypted transaction record
        transactions[transactionId] = EncryptedTransaction({
            transactionId: FHE.asEuint32(uint32(transactionId)),
            amount: internalAmount,
            timestamp: FHE.asEuint32(uint32(block.timestamp)),
            isDeposit: FHE.asEbool(true),
            user: msg.sender,
            blockNumber: block.number
        });

        // Update vault balance (encrypted)
        vaults[_vaultId].totalDeposits = FHE.add(vaults[_vaultId].totalDeposits, internalAmount);
        vaults[_vaultId].balance = FHE.add(vaults[_vaultId].balance, internalAmount);
        vaults[_vaultId].transactionCount = FHE.add(vaults[_vaultId].transactionCount, FHE.asEuint32(1));
        vaults[_vaultId].lastActivity = block.timestamp;

        // Update user reputation
        userReputation[msg.sender] = FHE.add(userReputation[msg.sender], FHE.asEuint32(1));

        emit VaultDeposited(_vaultId, msg.sender, 0); // Amount encrypted, emit 0
        return transactionId;
    }

    /**
     * @dev Withdraw funds from a vault with encrypted amount
     */
    function withdrawFromVault(
        uint256 _vaultId,
        externalEuint32 _amount,
        bytes calldata _inputProof
    ) external returns (uint256) {
        require(vaults[_vaultId].owner == msg.sender, "Not vault owner");
        require(vaults[_vaultId].owner != address(0), "Vault does not exist");
        
        // Convert external encrypted amount to internal
        euint32 internalAmount = FHE.fromExternal(_amount, _inputProof);
        
        uint256 transactionId = transactionCounter++;
        
        // Create encrypted transaction record
        transactions[transactionId] = EncryptedTransaction({
            transactionId: FHE.asEuint32(uint32(transactionId)),
            amount: internalAmount,
            timestamp: FHE.asEuint32(uint32(block.timestamp)),
            isDeposit: FHE.asEbool(false),
            user: msg.sender,
            blockNumber: block.number
        });

        // Update vault balance (encrypted)
        vaults[_vaultId].totalWithdrawals = FHE.add(vaults[_vaultId].totalWithdrawals, internalAmount);
        vaults[_vaultId].balance = FHE.sub(vaults[_vaultId].balance, internalAmount);
        vaults[_vaultId].transactionCount = FHE.add(vaults[_vaultId].transactionCount, FHE.asEuint32(1));
        vaults[_vaultId].lastActivity = block.timestamp;

        // Transfer ETH to user (amount would need to be decrypted off-chain)
        // For now, we'll use a placeholder amount
        uint256 withdrawAmount = 0; // This would need to be decrypted off-chain
        payable(msg.sender).transfer(withdrawAmount);

        emit VaultWithdrawn(_vaultId, msg.sender, 0); // Amount encrypted, emit 0
        return transactionId;
    }

    /**
     * @dev Update security metrics for a vault
     */
    function updateSecurityMetrics(
        uint256 _vaultId,
        externalEuint32 _riskScore,
        externalEuint32 _securityScore,
        bytes calldata _inputProof
    ) external onlySecurityAdmin {
        require(vaults[_vaultId].owner != address(0), "Vault does not exist");
        
        // Convert external encrypted data to internal
        euint32 internalRiskScore = FHE.fromExternal(_riskScore, _inputProof);
        euint32 internalSecurityScore = FHE.fromExternal(_securityScore, _inputProof);
        
        // Update vault risk score
        vaults[_vaultId].riskScore = internalRiskScore;
        
        // Update security metrics
        securityMetrics[_vaultId].securityScore = internalSecurityScore;
        securityMetrics[_vaultId].lastUpdate = block.timestamp;

        emit AnalyticsUpdated(_vaultId, 0, 0); // Values encrypted
    }

    /**
     * @dev Report security alert
     */
    function reportSecurityAlert(
        uint256 _vaultId,
        string memory _alertType,
        string memory _message,
        externalEuint32 _severity,
        bytes calldata _inputProof
    ) external onlySecurityAdmin {
        require(vaults[_vaultId].owner != address(0), "Vault does not exist");
        
        // Convert external encrypted severity to internal
        // euint32 internalSeverity = FHE.fromExternal(_severity, _inputProof);
        
        // Update security metrics
        securityMetrics[_vaultId].totalAlerts = FHE.add(securityMetrics[_vaultId].totalAlerts, FHE.asEuint32(1));
        
        // Check if high severity (would need to be decrypted off-chain)
        // For now, we'll assume severity > 7 is high
        securityMetrics[_vaultId].highRiskTransactions = FHE.add(
            securityMetrics[_vaultId].highRiskTransactions, 
            FHE.asEuint32(1)
        );

        emit SecurityAlert(_vaultId, _alertType, _message);
    }

    /**
     * @dev Lock/unlock a vault for security
     */
    function toggleVaultLock(uint256 _vaultId, bool _locked) external onlySecurityAdmin {
        require(vaults[_vaultId].owner != address(0), "Vault does not exist");
        
        vaults[_vaultId].isLocked = FHE.asEbool(_locked);
        
        if (_locked) {
            emit SecurityAlert(_vaultId, "LOCK", "Vault locked for security");
        }
    }

    /**
     * @dev Get vault information (returns encrypted data)
     */
    function getVaultInfo(uint256 _vaultId) external view returns (
        string memory name,
        string memory description,
        address owner,
        uint256 createdAt,
        uint256 lastActivity
    ) {
        require(vaults[_vaultId].owner != address(0), "Vault does not exist");
        
        SecureVault storage vault = vaults[_vaultId];
        return (
            vault.name,
            vault.description,
            vault.owner,
            vault.createdAt,
            vault.lastActivity
        );
    }

    /**
     * @dev Get user's vault list
     */
    function getUserVaults(address _user) external view returns (uint256[] memory) {
        return userVaults[_user];
    }

    // Modifiers
    modifier onlySecurityAdmin() {
        require(securityAdmins[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier onlyAuthorizedOperator() {
        require(authorizedOperators[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    // Admin functions
    function addSecurityAdmin(address _admin) external onlyOwner {
        securityAdmins[_admin] = true;
    }

    function removeSecurityAdmin(address _admin) external onlyOwner {
        securityAdmins[_admin] = false;
    }

    function addAuthorizedOperator(address _operator) external onlyOwner {
        authorizedOperators[_operator] = true;
    }

    function removeAuthorizedOperator(address _operator) external onlyOwner {
        authorizedOperators[_operator] = false;
    }

    function updateSecurityOracle(address _newOracle) external onlyOwner {
        securityOracle = _newOracle;
    }

    // Carbon Trading Functions
    
    /**
     * @dev Create a new carbon offset project
     */
    function createCarbonOffset(
        string memory _symbol,
        string memory _name,
        string memory _description,
        string memory _location,
        string memory _projectType,
        uint256 _price,
        uint256 _totalSupply
    ) external onlyOwner {
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(_price > 0, "Price must be positive");
        require(_totalSupply > 0, "Supply must be positive");
        require(!carbonOffsets[_symbol].isActive, "Offset already exists");
        
        carbonOffsets[_symbol] = CarbonOffset({
            symbol: _symbol,
            name: _name,
            description: _description,
            location: _location,
            projectType: _projectType,
            currentPrice: _price,
            totalSupply: _totalSupply,
            availableSupply: _totalSupply,
            isVerified: true,
            isActive: true,
            createdAt: block.timestamp
        });
        
        offsetSymbols.push(_symbol);
        emit CarbonOffsetCreated(_symbol, _name, _price, _totalSupply);
    }
    
    /**
     * @dev Place a carbon offset order with encrypted data
     */
    function placeCarbonOrder(
        string memory _symbol,
        externalEuint32 _orderType,
        externalEuint32 _quantity,
        externalEuint32 _price,
        bytes calldata _inputProof
    ) external {
        require(carbonOffsets[_symbol].isActive, "Carbon offset not active");
        require(carbonOffsets[_symbol].availableSupply > 0, "No supply available");
        
        // Convert external encrypted data to internal
        euint32 internalOrderType = FHE.fromExternal(_orderType, _inputProof);
        euint32 internalQuantity = FHE.fromExternal(_quantity, _inputProof);
        euint32 internalPrice = FHE.fromExternal(_price, _inputProof);
        
        orderCounter++;
        
        carbonOrders[orderCounter] = CarbonOrder({
            trader: msg.sender,
            orderId: FHE.asEuint32(uint32(orderCounter)),
            orderType: internalOrderType,
            quantity: internalQuantity,
            price: internalPrice,
            offsetSymbol: FHE.asEuint32(0), // Will be set from symbol
            isExecuted: FHE.asEbool(false),
            timestamp: block.timestamp
        });
        
        emit CarbonOrderPlaced(orderCounter, msg.sender, _symbol, 0, 0); // Encrypted data
    }
    
    /**
     * @dev Execute a carbon offset order
     */
    function executeCarbonOrder(
        uint256 _orderId,
        externalEuint32 _quantity,
        externalEuint32 _price,
        bytes calldata _inputProof
    ) external onlyAuthorizedOperator {
        require(_orderId <= orderCounter, "Order does not exist");
        // require(!FHE.decrypt(carbonOrders[_orderId].isExecuted), "Order already executed");
        
        // Convert external encrypted data to internal
        euint32 internalQuantity = FHE.fromExternal(_quantity, _inputProof);
        euint32 internalPrice = FHE.fromExternal(_price, _inputProof);
        
        // Mark order as executed
        carbonOrders[_orderId].isExecuted = FHE.asEbool(true);
        
        // Update portfolio (encrypted)
        CarbonPortfolio storage portfolio = carbonPortfolios[carbonOrders[_orderId].trader];
        portfolio.tradeCount = FHE.add(portfolio.tradeCount, FHE.asEuint32(1));
        // portfolio.totalOffsets = FHE.add(portfolio.totalOffsets, FHE.asEuint64(uint64(FHE.decrypt(internalQuantity))));
        
        emit CarbonOrderExecuted(_orderId, carbonOrders[_orderId].trader, "", 0, 0); // Encrypted data
    }
    
    /**
     * @dev Get carbon offset information
     */
    function getCarbonOffsetInfo(string memory _symbol) external view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        uint256,
        bool,
        bool
    ) {
        CarbonOffset storage offset = carbonOffsets[_symbol];
        return (
            offset.symbol,
            offset.name,
            offset.description,
            offset.location,
            offset.projectType,
            offset.currentPrice,
            offset.totalSupply,
            offset.availableSupply,
            offset.isVerified,
            offset.isActive
        );
    }
    
    /**
     * @dev Get all carbon offset symbols
     */
    function getAllCarbonOffsetSymbols() external view returns (string[] memory) {
        return offsetSymbols;
    }
    
    /**
     * @dev Get carbon portfolio value (returns encrypted data)
     */
    function getCarbonPortfolioValue(address _trader) external view returns (euint64, euint64, euint64, euint32) {
        CarbonPortfolio storage portfolio = carbonPortfolios[_trader];
        return (
            portfolio.totalOffsets,
            portfolio.portfolioValue,
            portfolio.totalPnl,
            portfolio.tradeCount
        );
    }
    
    /**
     * @dev Get carbon holding (plaintext)
     */
    function getCarbonHolding(address _trader, string memory _symbol) external view returns (uint256) {
        return carbonPortfolios[_trader].holdings[_symbol];
    }
    
    /**
     * @dev Update carbon offset price
     */
    function updateCarbonOffsetPrice(string memory _symbol, uint256 _newPrice) external onlyOwner {
        require(carbonOffsets[_symbol].isActive, "Carbon offset not active");
        require(_newPrice > 0, "Price must be positive");
        
        carbonOffsets[_symbol].currentPrice = _newPrice;
    }
    
    /**
     * @dev Get user's carbon order IDs
     */
    function getUserCarbonOrderIds(address _user) external view returns (uint256[] memory) {
        uint256[] memory userOrders = new uint256[](orderCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= orderCounter; i++) {
            if (carbonOrders[i].trader == _user) {
                userOrders[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userOrders[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get carbon order encrypted data by ID
     */
    function getCarbonOrderEncryptedData(uint256 _orderId) external view returns (euint32, euint32, euint32, euint32, ebool, uint256) {
        require(_orderId <= orderCounter, "Order does not exist");
        CarbonOrder storage order = carbonOrders[_orderId];
        
        return (
            order.orderId,
            order.orderType,
            order.quantity,
            order.price,
            order.isExecuted,
            order.timestamp
        );
    }
    
    /**
     * @dev Get carbon order basic info (non-encrypted)
     */
    function getCarbonOrderInfo(uint256 _orderId) external view returns (address, uint256, bool) {
        require(_orderId <= orderCounter, "Order does not exist");
        CarbonOrder storage order = carbonOrders[_orderId];
        
        return (
            order.trader,
            order.timestamp,
            FHE.decrypt(order.isExecuted)
        );
    }

    // Emergency functions
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
    }

    function emergencyUnpause() external onlyOwner {
        // Implementation for emergency unpause
    }
}
