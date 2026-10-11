import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MilestonePotModule", (m) => {
  const milestonePot = m.contract("MilestonePot");

  return { milestonePot };
});
