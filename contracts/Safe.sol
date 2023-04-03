//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Safe {
    // Store balances for each user and token
    mapping(address => mapping(address => uint256)) private balances;

    // Declare owner variable 
    address public owner;

    // Set the owner once and only once.
    constructor(address _owner) {
        owner = _owner; // Set the owner to the contract deployer
    }

    // Move token out of this contract (only the fee).
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

}