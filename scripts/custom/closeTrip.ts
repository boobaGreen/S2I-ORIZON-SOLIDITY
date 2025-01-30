import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Carica le variabili di ambiente dal file .env
dotenv.config();

async function main() {
  // Ottieni il parametro per il numero del viaggio da chiudere
  const tripId = process.env.TRIP_ID;

  if (!tripId) {
    throw new Error("TRIP_ID must be specified in the environment variables.");
  }

  // Ottieni il chain ID della rete corrente
  const chainId = (await ethers.provider.getNetwork()).chainId;

  // Leggi l'indirizzo del contratto dal file JSON specifico per la rete
  const addressesFilePath = path.join(
    __dirname,
    "deployments",
    `addresses-${chainId}.json`
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

  // Chiudi il viaggio specificato
  const tx = await tripManager.closeTrip(tripId);

  // Attendi che la transazione venga confermata
  await tx.wait();

  console.log(`Trip ${tripId} closed successfully.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
