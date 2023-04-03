//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Proxy {

    // Unstructured storage for owner and implementation
    bytes32 private constant OWNER_SLOT = keccak256("proxy.owner");
    bytes32 private constant IMPLEMENTATION_SLOT = keccak256("proxy.implementation");

    // Store balances for each user and token
    mapping(address => mapping(address => uint256)) private balances;

    // Set the owner 
    constructor(address _owner, address _implementation) {
        _setOwner(_owner);
        _setImplementation(_implementation);
    }

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == _getOwner(), "Proxy: caller is not the owner");
        _;
    }

    function _getOwner() private view returns (address) {
        return StorageSlot.getAddressSlot(OWNER_SLOT).value;
    }

    function _setOwner(address _owner) private {
        require(_owner != address(0), "admin = zero address");
        StorageSlot.getAddressSlot(OWNER_SLOT).value = _owner;
    }

    function _getImplementation() private view returns (address) {
        return StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value;
    }

    function _setImplementation(address _implementation) private {
        require(_implementation.code.length > 0, "New implementation address should be a contract");
        StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value = _implementation;
    }

    // Update the implementation contract, only callable by the owner
    function setImplementation(address newImplementation) public onlyOwner {
        _setImplementation(newImplementation);
    }

    // Get the owner of the proxy contract
    function getProxyOwner() public view returns (address) {
        return _getOwner();
    }

    // Get the implementation contract address
    function getImplementation() public view returns (address) {
        return _getImplementation();
    }



    // Fallback function to delegate calls to the implementation contract
    fallback() external payable {
        _delegate(_getImplementation());
    }

    receive() external payable {
        _delegate(_getImplementation());
    }

    function _delegate(address impl) internal {
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)

            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    function getAddressSlot(
        bytes32 slot
    ) internal pure returns (AddressSlot storage r) {
        assembly {
            r.slot := slot
        }
    }
}