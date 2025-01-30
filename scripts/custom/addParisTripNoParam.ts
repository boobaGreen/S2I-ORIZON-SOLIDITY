import { ethers } from "hardhat";
import { addDefaultTripToParis } from "../../utils/utils";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Carica le variabili di ambiente dal file .env
dotenv.config();

async function main() {
  // Ottieni il chain ID della rete corrente
  const chainId = (await ethers.provider.getNetwork()).chainId;

  //Leggi l'indirizzo del contratto dal file JSON specifico per la rete
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

  // Aggiungi il viaggio predefinito a Parigi
  await addDefaultTripToParis(tripManager, provider);

  console.log("Default trip to Paris added successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
