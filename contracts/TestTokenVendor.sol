//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import "./TestToken.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface Students {
  function getStudentsList() external view returns (string[] memory);
}

contract TestTokenVendor is Ownable {

  address constant STUDENTS_ADDRESS = 0x0E822C71e628b20a35F8bCAbe8c11F274246e64D;
  TestToken token;
  AggregatorV3Interface priceFeed;

  constructor(address tokenAddress) {
    token = TestToken(tokenAddress);
    priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
  }

  function getLatestPrice() public view returns (uint256) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return uint256(price);
    }

  function buyTokens() public payable {
    require(msg.value > 0, "Send ETH to buy some tokens");

    uint256 amountToBuy = msg.value * (getLatestPrice() / getStudentsLength()) / (10 ** priceFeed.decimals());

    uint256 vendorBalance = token.balanceOf(address(this));
    if(vendorBalance < amountToBuy) {
        msg.sender.call{value: msg.value}("Sorry, there is not enough tokens to buy");
        return;
    }

    (bool sent) = token.transfer(msg.sender, amountToBuy);
    require(sent, "Failed to transfer token to user");
  }

    function getStudentsLength() public view returns (uint256) {
        Students students = Students(STUDENTS_ADDRESS);
        return students.getStudentsList().length;
    }
}