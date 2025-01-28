import { ethers } from "hardhat";

export const ONE_DAY = 86400;

export async function addDefaultTripToParis(tripManager: any, provider: any) {
  const startDate = Math.floor(Date.now() / 1000) + ONE_DAY * 1 + 60; //  little gap of 60ms to avoid same start date
  const endDate = Math.floor(Date.now() / 1000) + ONE_DAY * 3;
  const price = ethers.parseEther("1").toString();

  await tripManager.addTrip(
    "Trip to Paris",
    "Paris",
    startDate,
    endDate,
    price,
    10, // maxClients
    { from: provider.address }
  );
}

export async function addDefaultTripToBerlin(tripManager: any, provider: any) {
  const startDate = Math.floor(Date.now() / 1000) + ONE_DAY * 7;
  const endDate = Math.floor(Date.now() / 1000) + ONE_DAY * 12;
  const price = ethers.parseEther("1").toString();

  await tripManager.addTrip(
    "Trip to Berlin",
    "Berlin",
    startDate,
    endDate,
    price,
    10, // maxClients
    { from: provider.address }
  );
}

export async function addDefaultTripToTokyo(tripManager: any, provider: any) {
  const startDate = Math.floor(Date.now() / 1000) + ONE_DAY * 1;
  const endDate = Math.floor(Date.now() / 1000) + ONE_DAY * 10;
  const price = ethers.parseEther("1").toString();

  await tripManager.addTrip(
    "Trip to Tokyo",
    "Tokyo",
    startDate,
    endDate,
    price,
    10, // maxClients
    { from: provider.address }
  );
}

export async function addDefaultTripToRome(tripManager: any, provider: any) {
  const startDate = Math.floor(Date.now() / 1000) + ONE_DAY * 2;
  const endDate = Math.floor(Date.now() / 1000) + ONE_DAY * 5;
  const price = ethers.parseEther("1").toString();

  await tripManager.addTrip(
    "Trip to Rome",
    "Rome",
    startDate,
    endDate,
    price,
    10, // maxClients
    { from: provider.address }
  );
}

export async function addDefaultTripToNeyYork(tripManager: any, provider: any) {
  const startDate = Math.floor(Date.now() / 1000) + ONE_DAY * 2;
  const endDate = Math.floor(Date.now() / 1000) + ONE_DAY * 5;
  const price = ethers.parseEther("1").toString();

  await tripManager.addTrip(
    "Trip to Rome",
    "Rome",
    startDate,
    endDate,
    price,
    1, // maxClients
    { from: provider.address }
  );
}
