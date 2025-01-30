// TRIP_ID=2 ETH_AMOUNT=0.015 npx hardhat run scripts/bookTrip.ts --network localhost
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Carica le variabili di ambiente dal file .env
dotenv.config();

async function main() {
  // Ottieni i parametri per il numero del viaggio e l'importo degli ETH da inviare
  const tripId = process.env.TRIP_ID;
  const ethAmount = process.env.ETH_AMOUNT;

  if (!tripId || !ethAmount) {
    throw new Error(
      "TRIP_ID and ETH_AMOUNT must be specified in the environment variables."
    );
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
    process.env.CLIENT_PRIVATE_KEY!,
    ethers.provider
  );

  // Ottieni il contratto TripManager distribuito con il provider specifico
  const tripManager = await ethers.getContractAt(
    "TripManager",
    tripManagerAddress,
    provider
  );

  // Prenota un viaggio e invia l'importo specificato di ETH
  const tx = await tripManager.bookTrip(tripId, {
    value: ethers.parseEther(ethAmount),
  });

  // Attendi che la transazione venga confermata
  await tx.wait();

  console.log(`Trip ${tripId} booked with ${ethAmount} ETH!`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
