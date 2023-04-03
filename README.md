# 311581012-bdaf-lab4

## Proxies, Proxies everywhere
There are five contracts in this repo:
- **Safe** : contract allows deposit, withdraw and takes a 0.1% tax.
- **SafeUpgradeable** : implementation of Safe contract, but **in Proxy pattern**.
    - Constructor becomes a separate callable function.
- **Proxy** : 
    - Use unstructured storage to store “owner” and “implementation”.
    - The “owner” should be able to update the implementation of the proxy.
- **SafeFactory** : a factory that deploys proxies that point to the **SafeUpgradeable** implementation.
- **MockDaiToken** : a contract that deploys an ERC20 token for test.


# How to run it
## Install dependencies
With [npm](https://npmjs.org/) installed, run

    $ npm install 
    
## Create a .env file and set your personal key
  set your PRIVATE_KEY, infura ENDPOINT_URL (goerli), ETHERSCAN_API_KEY and set REPORT_GAS to true
  
    $ PRIVATE_KEY = ""
    $ ENDPOINT_URL = ""
    $ ETHERSCAN_API_KEY = ""
    $ REPORT_GAS = true
    
## Compile
    $ npx hardhat compile
    
## Test the five contracts and get the gas report
there are four different javascript files in /test to test each contract
    $ npx hardhat test
 
## Solidity Coverage Test
    $ npx hardhat coverage --testfiles "test/*"


## Test Report  
 ![image](https://github.com/EPJ-coding/311581012-bdaf-lab4/blob/main/pictures/test.png)
    
## Gas Report  
 ![image](https://github.com/EPJ-coding/311581012-bdaf-lab4/blob/main/pictures/gas_report.png)

## Coverage Report  
 ![image](https://github.com/EPJ-coding/311581012-bdaf-lab4/blob/main/pictures/coverage.png)
 

