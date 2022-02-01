require("@nomiclabs/hardhat-waffle");
const dotenv = require('dotenv');
dotenv.config();

const INFURA_API_KEY = process.env.INFURA_API_KEY;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

task("donate", "Donate to charity")
  .addParam("account", "Your ETH address")
  .addParam("amount", "Amount of ETH")
  .setAction(async function ({ account, amount }) {
    const Charity = await ethers.getContractFactory("Charity");
    const charity = Charity.attach(CONTRACT_ADDRESS);
    const addr = await ethers.getSigner(account);

    await (await charity.connect(addr).donate({ value: amount })).wait();

    console.log(`${account} has donated ${amount}`);
  });

task("withdrawAll", "Withdraw all amount of ETH")
  .addParam("account", "Address to withdraw")
  .setAction(async function ({ account }) {
    const Charity = await ethers.getContractFactory("Charity");
    const charity = Charity.attach(CONTRACT_ADDRESS);
    const [addr] = await ethers.getSigners();

    await (await charity.connect(addr).withdrawAll(account)).wait();

    console.log(`all amount of ETH has withdrawn to ${account}`);
  });

task("partialWithdraw", "Withdraw partial amount of ETH")
  .addParam("account", "Address to withdraw")
  .addParam("amount", "Amount of ETH")
  .setAction(async function ({ account, amount }) {
    const Charity = await ethers.getContractFactory("Charity");
    const charity = Charity.attach(CONTRACT_ADDRESS);
    const [addr] = await ethers.getSigners();

    await (await charity.connect(addr).partialWithdraw(account, { value: amount })).wait();

    console.log(`${amount} amount of ETH has withdrawn to ${account}`);
  });

task("balanceOfDonations", "Shows balance of donations")
  .setAction(async function () {
    const Charity = await ethers.getContractFactory("Charity");
    const charity = Charity.attach(CONTRACT_ADDRESS);
    const [addr] = await ethers.getSigners();

    const balanceOfDonations = await charity.connect(addr).balanceOfDonations();

    console.log("Balance of donations: " + ethers.utils.formatEther(balanceOfDonations) + " ETH");
  });

task("donaters", "Shows all donaters")
  .setAction(async function () {
    const Charity = await ethers.getContractFactory("Charity");
    const charity = Charity.attach(CONTRACT_ADDRESS);
    const [addr] = await ethers.getSigners();

    const donaters = await charity.connect(addr).getAllDonaters();

    for (i = 0; i < donaters.length; i++) {
      console.log(`${i + 1}: ` + donaters[i]);
    }
  });

task("balanceOf", "Shows balance of account")
  .addParam("account", "Account address")
  .setAction(async function ({ account }) {
    const Charity = await ethers.getContractFactory("Charity");
    const charity = Charity.attach(CONTRACT_ADDRESS);
    const [addr] = await ethers.getSigners();

    const balanceOf = await charity.connect(addr).balanceOf(account);

    console.log(`Balance of ${account} : ` + ethers.utils.formatEther(balanceOf) + "ETH");
  });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.3",
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`${RINKEBY_PRIVATE_KEY}`]
    }
  }
};

