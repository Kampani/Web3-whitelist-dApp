//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

//this contract will limit the users being added into the whiltelist
contract Whitelist{  

    //to store the current no of users added
    uint8 public numAddressesWhitelisted;

    //to store the max num of users to be whitelisted
    uint8 public maxWhitelistAddresses;

    //this constructor gets called at deployment, taking the no of maxWhitelistAddresses as the limit
    constructor(uint8 _maxWhitelistAddresses){
        maxWhitelistAddresses = _maxWhitelistAddresses;
    }

    mapping(address => bool) public whitelistedAddresses;

    function addingAddresses() public{
        //check whether user already exists or not
        require(!whitelistedAddresses[msg.sender],'User already added');

        //check whether slots available or not
        require(numAddressesWhitelisted < maxWhitelistAddresses,'cannot add user, limit reached');

        //if requirements passed, add user to whitelist
        whitelistedAddresses[msg.sender] = true;

        //increase current users by 1
        numAddressesWhitelisted += 1;
    }
}
