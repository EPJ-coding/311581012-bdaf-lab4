//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SafeUpgradeable {
    // Store balances for each user and token
    mapping(address => mapping(address => uint256)) private balances;

    // Declare owner variable 
    address public owner;
    bool private initialized = false;
    string constant public version = "v1";

    // Initialize the contract, can only be called once by the owner
    function initialize(address _owner) public {
        require(!initialized, "Safe contract already initialized");
        owner = _owner; // Set the owner to the initializer
        initialized = true;
    }

    // Move token out of this contract (only the fee)
    function takeFee(address token) public {
        require(msg.sender == owner, "Only owner can transfer out");
        uint256 fee = balances[owner][token];
        IERC20(token).transfer(msg.sender, fee);
        balances[owner][token] = 0;
    }

    // Deposit tokens and charge a 0.1% fee.
    function deposit(address token, uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        uint256 fee = amount / 1000;
        uint256 depositAmount = amount - fee;
        balances[msg.sender][token] += depositAmount;
        balances[owner][token] += fee;
    }

    // Withdraw tokens.
    function withdraw(address token, uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
        balances[msg.sender][token] -= amount;
    }

    function balanceOf(address token) public view returns (uint256) {
        return balances[msg.sender][token];
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getVersion() public view returns (string memory) {
        return version;
    }

}



/*
Following contract is used for testing the update of the implementation

SafeUpgradeableV2 contract info:

(1) Change the "version" -> v2
(2) Update the tax rate to 0.02%

*/

contract SafeUpgradeableV2 {
    // Store balances for each user and token
    mapping(address => mapping(address => uint256)) private balances;

    // Declare owner variable 
    address public owner;
    bool private initialized = false;
    string constant public version = "v2";

    // Initialize the contract, can only be called once by the owner
    function initialize(address _owner) public {
        require(!initialized, "Safe contract already initialized");
        owner = _owner; // Set the owner to the initializer
        initialized = true;
    }

    // Move token out of this contract (only the fee)
    function takeFee(address token) public {
        require(msg.sender == owner, "Only owner can transfer out");
        uint256 fee = balances[owner][token];
        IERC20(token).transfer(msg.sender, fee);
        balances[owner][token] = 0;
    }

    // Deposit tokens and charge a 0.1% fee.
    function deposit(address token, uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        uint256 fee = amount / 500;
        uint256 depositAmount = amount - fee;
        balances[msg.sender][token] += depositAmount;
        balances[owner][token] += fee;
    }

    // Withdraw tokens.
    function withdraw(address token, uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
        balances[msg.sender][token] -= amount;
    }

    function balanceOf(address token) public view returns (uint256) {
        return balances[msg.sender][token];
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getVersion() public view returns (string memory) {
        return version;
    }

}