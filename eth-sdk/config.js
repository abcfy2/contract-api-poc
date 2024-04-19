const {defineConfig} = require('@dethcrypto/eth-sdk');
const dotenv = require('dotenv');

dotenv.config();

module.exports = defineConfig({
  contracts: {
    [process.env.CHAIN_NAME]: {
      [process.env.CONTRACT_NAME]: process.env.CONTRACT_ADDRESS,
    },
  },
  rpc: {
    // TODO: fix with infura provider rpc url
    [process.env.CHAIN_NAME]:
      `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  },
});
