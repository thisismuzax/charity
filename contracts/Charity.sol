// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Charity {
    // mapping to store which address donated how much coins
    mapping(address => uint256) private addressToAmount;
    // array of addresses who donated
    address[] private donaters;
    // number of total donations
    uint256 private totalDonations;
    // address of contract's owner
    address public owner;

    // the first person to deploy the contract is the owner
    constructor() {
        owner = msg.sender;
    }

    // function to donate some amount of coins // 110564
    function donate() external payable {
        // is the value more than 0
        require(msg.value > 0, "You need to spend more!");

        // is this address donated before
        if (addressToAmount[msg.sender] == 0) {
            // if not, adds this address to 'donaters' array
            donaters.push(msg.sender);
        }

        addressToAmount[msg.sender] += msg.value;

        // adds an amount to total
        totalDonations += msg.value;
    }

    // is this owner's address or not?
    modifier onlyOwner() {
        require(msg.sender == owner, "Can use only owner's address");

        _;
    }

    // function to withdraw all amount of coins.
    // can use only with owner's address
    function withdrawAll(address account) public payable onlyOwner {
        // transfer from contract's address to owner's address
        payable(account).transfer(address(this).balance);

        for (uint256 i = 0; i < donaters.length; i++) {
            address donater = donaters[i];
            addressToAmount[donater] = 0;
        }

        donaters = new address[](0);
        totalDonations = 0;
    }

    // function to get a certain amount of coins
    // can use only with owner's address
    function partialWithdraw(address account) external payable onlyOwner {
        // is amount bigger or equal to 'totalDonations'
        require(totalDonations >= msg.value, "Wrong amount");

        if (msg.value == totalDonations) {
            withdrawAll(account);
        }

        payable(account).transfer(msg.value);

        totalDonations -= msg.value;
    }

    // function to get all donaters
    function getAllDonaters() external view returns (address[] memory) {
        return donaters;
    }

    // function to get sum of donations of 1 address
    function balanceOf(address account) external view returns (uint256) {
        return addressToAmount[account];
    }

    // function to get a number of all donations
    function balanceOfDonations() external view returns (uint256) {
        return totalDonations;
    }
}
