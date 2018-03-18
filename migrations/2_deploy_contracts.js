var VirtLotto = artifacts.require("./VirtLotto.sol");

module.exports = function(deployer, network, accounts) {
  //deployer.deploy(VirtLotto, 100, 5);
  deployer.deploy(VirtLotto, web3.toWei(0.1, 'ether'), 3);
};
