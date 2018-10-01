let HDWalletProvider = require("truffle-hdwallet-provider");
let mnemonic = "village rely embrace donkey video demand crunch train throw trouble resource myth";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id,
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://kovan.infura.io/v3/00fb727a749c4c6e92f3ae58228bbc0c")
      },
      network_id: 42,
      // gas: 4700000
    }
  }
};