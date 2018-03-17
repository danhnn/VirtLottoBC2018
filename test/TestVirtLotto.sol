pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/VirtLotto.sol";

contract TestVirtLotto {
  VirtLotto virtLotto;

  function beforeAll() public {
    virtLotto = VirtLotto(DeployedAddresses.VirtLotto(),10,2);
  }

  function testCheckMinimumBet() public {
    // bool isOkay = virtLotto.checkMinimumBet(15);
    // Assert.equal(isOkay, true, "It should store the value 89.");
  }

}
