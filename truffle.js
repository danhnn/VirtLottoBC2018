module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      host: "127.0.0.1",
      port: 8545,
      gas: 2900000,
      network_id: "3" // Match any network id
    }
  },
  rpc: {
    host: "127.0.0.1",
    port: 8080
  }

};
