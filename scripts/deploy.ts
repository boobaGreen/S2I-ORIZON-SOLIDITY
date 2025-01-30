import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Carica le variabili di ambiente dal file .env
dotenv.config();

async function main() {
  const TripManager = await ethers.getContractFactory("TripManager");
  const tripManager = await TripManager.deploy();

  // Attendi che il contratto sia distribuito
  await tripManager.waitForDeployment();

  console.log("TripManager deployed to:", tripManager.target);

  // Ottieni il chain ID della rete corrente
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log("Chain ID:", chainId);

  // Se siamo su localhost, assegna un saldo iniziale agli account specificati
  if (Number(chainId) === 31337) {
    // 31337 è il chain ID predefinito per Hardhat Network (localhost)
    const provider = new ethers.Wallet(
      process.env.PROVIDER_PRIVATE_KEY!,
      ethers.provider
    );
    const client = new ethers.Wallet(
      process.env.CLIENT_PRIVATE_KEY!,
      ethers.provider
    );

    const initialBalance = ethers.parseEther("100"); // 100 ETH

    // Converti il saldo iniziale in una stringa esadecimale
    const hexBalance = `0x${initialBalance.toString(16)}`;

    // Assegna il saldo iniziale al provider
    await ethers.provider.send("hardhat_setBalance", [
      provider.address,
      hexBalance,
    ]);

    // Assegna il saldo iniziale al client
    await ethers.provider.send("hardhat_setBalance", [
      client.address,
      hexBalance,
    ]);

    console.log(
      `Assigned ${initialBalance} ETH to provider: ${provider.address}`
    );
    console.log(`Assigned ${initialBalance} ETH to client: ${client.address}`);
  } else if (Number(chainId) === 11155111) {
    // Sepolia chain ID
  }

  // Crea il percorso per la cartella deployments
  const deploymentsDir = path.join(__dirname, "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Salva l'indirizzo del contratto in un file JSON specifico per la rete
  const addressesFilePath = path.join(
    deploymentsDir,
    `addresses-${chainId}.json`
  );
  const addresses = {
    TripManager: tripManager.target,
  };
  fs.writeFileSync(addressesFilePath, JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
