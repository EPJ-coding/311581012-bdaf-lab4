const hre = require("hardhat");

async function main() {
  const Bank = await hre.ethers.getContractFactory("SafeUpgradeable");
  const bank = await Bank.deploy();

  await bank.deployed();

  console.log("Deployed to:", bank.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });