// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Safe.sol"; // Import Safe contract
import "./Proxy.sol"; // Import Proxy contract

contract SafeFactory {
    address public owner;
    address public implementation;
    address[] public deployedProxies;
    address[] public deployedSafes;

    event SafeCreated(address safe);
    event ProxyCreated(address proxy);
    event ImplementationUpdated(address newImplementation);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _owner, address _implementation) {
        owner = _owner;
        implementation = _implementation;
    }

    function deploySafe() external {
        Safe safe = new Safe(msg.sender);
        emit SafeCreated(address(safe));
        deployedSafes.push(address(safe));
    }


    function deploySafeProxy() external  {
        Proxy proxy = new Proxy(msg.sender, implementation);
        emit ProxyCreated(address(proxy));
        deployedProxies.push(address(proxy));
    }



    function updateImplementation(address newImp) external onlyOwner {
        require(newImp.code.length > 0 , "New implementation address should be a contract");
        implementation = newImp;
        emit ImplementationUpdated(implementation);
    }

  function getDeployedProxies() public view returns(address[] memory){
     return deployedProxies;
  }

  function getDeployedSafes() public view returns(address[] memory){
     return deployedSafes;
  }
}