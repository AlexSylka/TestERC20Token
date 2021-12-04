const TestToken = artifacts.require("TestToken");
const TestTokenVendor = artifacts.require("TestTokenVendor");
const {
   ETH_USD_AGGREGATOR_ADDRESS,
   DAI_ETH_AGGREGATOR_ADDRESS,
   DAI_TOKEN_CONTRACT_ADDRESS,
   STUDENTS_CONTRACT_ADDRESS
 } = process.env;

module.exports = async function (deployer) {
   await deployer.deploy(TestToken);
   const testTokenContract = await TestToken.deployed(); 
   await deployer.deploy(TestTokenVendor, testTokenContract.address, ETH_USD_AGGREGATOR_ADDRESS, 
      STUDENTS_CONTRACT_ADDRESS, DAI_ETH_AGGREGATOR_ADDRESS, DAI_TOKEN_CONTRACT_ADDRESS);
};
