import hre from "hardhat";
import TripManagerModule from "../ignition/modules/TripManager";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const { tripManager } = await hre.ignition.deploy(TripManagerModule);

  console.log(`TripManager deployed to: ${await tripManager.getAddress()}`);

  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  console.log("Chain ID:", chainId);

  if (Number(chainId) === 31337) {
    const provider = new hre.ethers.Wallet(
      process.env.PROVIDER_PRIVATE_KEY!,
      hre.ethers.provider
    );
    const client = new hre.ethers.Wallet(
      process.env.CLIENT_PRIVATE_KEY!,
      hre.ethers.provider
    );

    const initialBalance = hre.ethers.parseEther("100"); // 100 ETH
    const hexBalance = `0x${initialBalance.toString(16)}`;

    await hre.ethers.provider.send("hardhat_setBalance", [
      provider.address,
      hexBalance,
    ]);

    await hre.ethers.provider.send("hardhat_setBalance", [
      client.address,
      hexBalance,
    ]);

    console.log(
      `Assigned ${initialBalance} ETH to provider: ${provider.address}`
    );
    console.log(`Assigned ${initialBalance} ETH to client: ${client.address}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
