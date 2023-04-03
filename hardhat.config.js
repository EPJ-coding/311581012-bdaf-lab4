//require("@nomiclabs/hardhat-ethers");
//require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-truffle5");
require("dotenv").config();
require('solidity-coverage')
require("hardhat-gas-reporter");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ENDPOINT_URL = process.env.ENDPOINT_URL;

module.exports = {
  solidity: "0.8.0",
  
  networks: {
    goerli: {
      url: ENDPOINT_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
 },

  gasReporter: {
  enabled: (process.env.REPORT_GAS) ? true : false, 
  currency: 'CHF',
  gasPrice: 21
  }

};