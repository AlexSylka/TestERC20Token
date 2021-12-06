const truffleAssert = require('truffle-assertions');
import { assert, web3, artifacts } from "hardhat";


const TestTokenVendor = artifacts.require("TestTokenVendor");
const TestToken = artifacts.require("TestToken");

const bn1e18 = web3.utils.toBN(1e18);

const STUDENTS_CONTRACT_ADDRESS=0x0E822C71e628b20a35F8bCAbe8c11F274246e64D
const ETH_USD_AGGREGATOR_ADDRESS=0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
const DAI_ETH_AGGREGATOR_ADDRESS=0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D
const DAI_TOKEN_CONTRACT_ADDRESS=0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa

describe("TestTokenVendor", () => {
  let accounts: string[];
  let owner: any;
  let payer: any;
  let testTokenInstance: any;
  let vendorInstance: any;

  const paymentAmount = bn1e18.muln(1);

  beforeEach(async function () {
    accounts = await web3.eth.getAccounts();
    owner = accounts[0];
    payer = accounts[1];
    testTokenInstance = await TestToken.new();
    vendorInstance = await TestTokenVendor.new(testTokenInstance.address, ETH_USD_AGGREGATOR_ADDRESS, STUDENTS_CONTRACT_ADDRESS, 
      DAI_ETH_AGGREGATOR_ADDRESS, DAI_TOKEN_CONTRACT_ADDRESS);

    await testTokenInstance.transfer(vendorInstance.address, web3.utils.toBN(1).mul(bn1e18));
  });

  describe( "buyTokens", function() {
    it("Should buyTokens successfully", async () => {
        const tokenBalanceBefore = await testTokenInstance.balanceOf(payer);
        const vendorTokenBalanceBefore = await testTokenInstance.balanceOf(vendorInstance.address);

        const result = await vendorInstance.buyTokens({from: payer, value: paymentAmount});

        truffleAssert.eventEmitted(result, 'Bought', (ev: any) => {
          return ev.payer.toLowerCase() === payer.toLowerCase() && ev.value.eq(web3.utils.toBN("1000000000000000000"));
        });

        const vendorTokenBalanceAfter = await testTokenInstance.balanceOf(vendorInstance.address);
        const tokenBalanceAfter = await testTokenInstance.balanceOf(payer);

        assert.notEqual(web3.utils.toBN(0), vendorTokenBalanceBefore.sub(vendorTokenBalanceAfter));
        assert.equal(true, tokenBalanceBefore.eq(tokenBalanceAfter.sub(vendorTokenBalanceBefore.sub(vendorTokenBalanceAfter))));
    });

    it("Should get back ether for too much bought amount", async () => {
      const ethBalanceBefore = await web3.eth.getBalance(payer);

      const result = await vendorInstance.buyTokens({from: payer, value: paymentAmount.mul(web3.utils.toBN(20))});

      truffleAssert.eventEmitted(result, 'BoughtFailed', (ev: any) => {
        return ev.payer.toLowerCase() === payer.toLowerCase() && ev.value.eq(paymentAmount.mul(web3.utils.toBN(20)));
      });

      const ethBalanceAfter = await web3.eth.getBalance(payer);

      const transaction = await web3.eth.getTransaction(result.tx);
      assert.equal(true, web3.utils.toBN(result.receipt.gasUsed).mul(web3.utils.toBN(transaction.gasPrice)).eq(web3.utils.toBN(ethBalanceBefore).sub(web3.utils.toBN(ethBalanceAfter))));
    });

    it("Should not be able to buy tokens due to 0 eth sent", async () => {
      await truffleAssert.reverts(
        vendorInstance.buyTokens({from: payer, value: 0}), 
        "Send ETH to buy some tokens"
      );
    });

  });

});



