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
   //const testTokenContract = await TestToken.deployed(); 
   //await deployer.deploy(TestTokenVendor, testTokenContract.address, ETH_USD_AGGREGATOR_ADDRESS, 
   //   STUDENTS_CONTRACT_ADDRESS, DAI_ETH_AGGREGATOR_ADDRESS, DAI_TOKEN_CONTRACT_ADDRESS);
   await deployer.deploy(TestTokenVendor, '0x48016F1c31A80d7AaC7b0335D3253Fa829afF303', '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e', 
         '0x0E822C71e628b20a35F8bCAbe8c11F274246e64D', '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D', '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa');
};
