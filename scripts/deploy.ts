import { ethers } from "hardhat";

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

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Update your frontend with the contract address");
  console.log("2. Configure environment variables");
  console.log("3. Test the contract functionality");
  console.log("4. Deploy to production when ready");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
