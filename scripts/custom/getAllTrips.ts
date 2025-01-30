import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Carica le variabili di ambiente dal file .env
dotenv.config();

async function main() {
  // Ottieni il chain ID della rete corrente
  const chainId = (await ethers.provider.getNetwork()).chainId;

  // Leggi l'indirizzo del contratto dal file JSON specifico per la rete
  const addressesFilePath = path.join(
    __dirname,
    `../../ignition/deployments/chain-${chainId}`,
    `deployed_addresses.json`
  );

  const addresses = JSON.parse(fs.readFileSync(addressesFilePath, "utf-8"));
  const tripManagerAddress = addresses.TripManager;

  // Ottieni il provider (signer) specifico
  const provider = new ethers.Wallet(
    process.env.PROVIDER_PRIVATE_KEY!,
    ethers.provider
  );

  // Ottieni il contratto TripManager distribuito con il provider specifico
  const tripManager = await ethers.getContractAt(
    "TripManager",
    tripManagerAddress,
    provider
  );

  // Chiama la funzione getAllTrips
  const trips = await tripManager.getAllTrips();

  console.log("All trips:", trips);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
