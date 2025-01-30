import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const chainId = (await ethers.provider.getNetwork()).chainId;

  const addressesFilePath = path.join(
    __dirname,
    `../../ignition/deployments/chain-${chainId}`,
    `deployed_addresses.json`
  );

  if (!fs.existsSync(addressesFilePath)) {
    throw new Error(`Addresses file not found at ${addressesFilePath}`);
  }

  const addresses = JSON.parse(fs.readFileSync(addressesFilePath, "utf-8"));
  const tripManagerAddress = addresses["TripManagerModule#TripManager"];

  if (!tripManagerAddress) {
    throw new Error(`TripManager address not found in ${addressesFilePath}`);
  }

  const tripManager = await ethers.getContractAt(
    "TripManager",
    tripManagerAddress
  );

  const startDate = Math.floor(Date.now() / 1000) + 86400 * 7; // 7 days from now
  const endDate = startDate + 86400 * 5; // 5 days duration
  const price = ethers.parseEther("0.015").toString();

  await tripManager.addTrip(
    "Trip to Amsterdam",
    "Amsterdam",
    startDate,
    endDate,
    price,
    10 // maxClients
  );

  console.log("Trip to Amsterdam added successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
