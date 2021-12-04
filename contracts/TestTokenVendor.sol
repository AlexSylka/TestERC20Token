//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import "./TestToken.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface Students {
  function getStudentsList() external view returns (string[] memory);
}

interface DaiToken {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient,uint256 amount) external returns (bool);
}

contract TestTokenVendor is Ownable {
  TestToken public token;
  DaiToken public daiToken;
  Students public students;
  AggregatorV3Interface public ethUsdPriceFeed;
  AggregatorV3Interface public daiEthPriceFeed;

  event Transfer( address sender, address recipient, uint256 amount);
  event TransferFailed( address sender, address recipient, uint256 amount, string reason);
  event Bought(address payer, uint256 value);
  event BoughtFailed(address payer, uint256 value, string reason);
  event Success(address owner);

  constructor(address _testTokenAddress, 
            address _ethUsdAggregator, 
            address _studentsContract, 
            address _daiEthAggregator,
            address _daiAddress) {
    token = TestToken(_testTokenAddress);
    students = Students(_studentsContract);
    ethUsdPriceFeed = AggregatorV3Interface(_ethUsdAggregator);
    daiEthPriceFeed = AggregatorV3Interface(_daiEthAggregator);
    daiToken = DaiToken(_daiAddress);
  }

  function getEthLatestPriceInUsd() public view returns (uint256) {
        (,int price,,,) = ethUsdPriceFeed.latestRoundData();
        return uint256(price);
  }

  function getTestTokenPriceInEth() public view returns (uint256) {
      return (getEthLatestPriceInUsd() / getStudentsLength()) / (10 ** ethUsdPriceFeed.decimals());
  }

    function getDaiTokenPriceInEth() public view returns (uint256) {
      (,int price,,,) = daiEthPriceFeed.latestRoundData();
      return uint256(price) / (18 ** daiEthPriceFeed.decimals());
  }

    function buyTokensWithDai() public payable{
        uint256 daiAmountToBuy = msg.value;
        require(daiAmountToBuy > 0, "Send DAI to buy some tokens");
        require(daiToken.balanceOf(msg.sender) < daiAmountToBuy, "Not enought Dai tokens");

        uint256 amountToBuy = (msg.value * getDaiTokenPriceInEth()) * getTestTokenPriceInEth();
       
        uint256 vendorBalance = token.balanceOf(address(this));
        require(vendorBalance < amountToBuy, "Sorry, there is not enough tokens to buy");

        try daiToken.transferFrom(msg.sender, address(this), daiAmountToBuy) {
            emit Transfer(msg.sender, address(this), daiAmountToBuy);
        } catch Error(string memory reason) {
            emit TransferFailed(msg.sender, address(this), daiAmountToBuy, reason);
            (bool success,) = msg.sender.call{ value: msg.value }(bytes(reason));
            require(success, "External call failed"); 
        } catch (bytes memory reason) {
            (bool success,) = msg.sender.call{value: msg.value}(reason);
            require(success, "External call failed");
        }

        try token.transfer(msg.sender, amountToBuy) {
            emit Bought(msg.sender, msg.value);
        } catch Error(string memory reason) {
            emit BoughtFailed(msg.sender, msg.value, reason);
            (bool success,) = msg.sender.call{ value: msg.value }(bytes(reason));
            require(success, "External call failed"); 
        } catch (bytes memory reason) {
            (bool success,) = msg.sender.call{value: msg.value}(reason);
            require(success, "External call failed");
        }
    }

  function buyTokens() public payable {
    require(msg.value > 0, "Send ETH to buy some tokens");

    uint256 amountToBuy = msg.value * getTestTokenPriceInEth();

    try token.transfer(msg.sender, amountToBuy) {
      emit Bought(msg.sender, msg.value);
    } catch Error(string memory reason) {
        emit BoughtFailed(msg.sender, msg.value, reason);
        (bool success,) = msg.sender.call{ value: msg.value }(bytes(reason));
        require(success, "External call failed"); 
    } catch (bytes memory reason) {
        (bool success,) = msg.sender.call{value: msg.value}(reason);
        require(success, "External call failed");
    } 

  }

  function getStudentsLength() public view returns (uint256) {
      return students.getStudentsList().length;
  }
}