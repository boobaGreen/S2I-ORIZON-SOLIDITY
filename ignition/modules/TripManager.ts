import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenv from "dotenv";

dotenv.config();

export default buildModule("TripManagerModule", (m) => {
  const tripManager = m.contract("TripManager");

  return { tripManager };
});
