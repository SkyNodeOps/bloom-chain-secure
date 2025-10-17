const { ethers } = require("hardhat");
const { writeFileSync } = require("fs");
const { join } = require("path");

async function main() {
  console.log("🚀 Starting Bloom Chain Secure deployment...");

  // Get the contract factory
  const BloomChainSecure = await ethers.getContractFactory("BloomChainSecure");
  
  // Deploy the contract
  console.log("📦 Deploying BloomChainSecure contract...");
  const bloomChainSecure = await BloomChainSecure.deploy(
    "0x0000000000000000000000000000000000000000" // Placeholder for security oracle
  );

  await bloomChainSecure.waitForDeployment();

  const contractAddress = await bloomChainSecure.getAddress();
  
  console.log("✅ BloomChainSecure deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 Explorer: https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Verify contract on Etherscan
  console.log("🔍 Verifying contract on Etherscan...");
  try {
    await bloomChainSecure.waitForDeployment();
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: ["0x0000000000000000000000000000000000000000"],
    });
    
    console.log("✅ Contract verified on Etherscan!");
  } catch (error) {
    console.log("⚠️  Contract verification failed:", error);
  }

  // Update contract address in frontend files
  console.log("📝 Updating contract address in frontend...");
  
  const contractInfo = {
    address: contractAddress,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
    explorer: `https://sepolia.etherscan.io/address/${contractAddress}`
  };
  
  // Write deployment info to JSON file
  writeFileSync(
    join(__dirname, "../deployment-info.json"),
    JSON.stringify(contractInfo, null, 2)
  );
  
  // Update contract address in contract.ts
  const contractTsPath = join(__dirname, "../src/lib/contract.ts");
  let contractTsContent = require("fs").readFileSync(contractTsPath, "utf8");
  contractTsContent = contractTsContent.replace(
    /export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";/,
    `export const CONTRACT_ADDRESS = "${contractAddress}";`
  );
  require("fs").writeFileSync(contractTsPath, contractTsContent);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Contract address has been automatically updated in frontend");
  console.log("2. Test the contract functionality");
  console.log("3. Deploy to production when ready");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
