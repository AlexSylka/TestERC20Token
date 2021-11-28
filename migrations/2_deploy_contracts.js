const TestToken = artifacts.require("TestToken");
const TestTokenVendor = artifacts.require("TestTokenVendor");

module.exports = async function (deployer) {
   await deployer.deploy(TestToken);
   const testTokenContract = await TestToken.deployed(); 
   await deployer.deploy(TestTokenVendor, testTokenContract.address);
};
