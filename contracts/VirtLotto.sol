pragma solidity ^0.4.18;

import "./usingOraclize.sol";

contract VirtLotto is usingOraclize {
  
  address public owner;

  mapping (address => uint[]) betMap;

  address[] pickers;

  uint public minimumBet;

  uint public totalCalls;

  uint public totalBetValue;

  uint public currentCalls;

  uint public lastWinNumber;

  uint8 MAX_TICKETS = 4;

  event LogNumber(
        uint value
  );

  event LogAddress(
        address value
  );

  event LogString(
        bytes32 value
  );

  function VirtLotto(uint _minimumBet, uint _totalCalls) public {
    owner = msg.sender;
    minimumBet = _minimumBet;
    totalCalls = _totalCalls;
    oraclize_setProof(proofType_Ledger); // sets the Ledger authenticity proof in the constructor
  }

  function getMinimumBet() public constant returns (uint) {
    return minimumBet;
  }

  function getLastWinNumber() public constant returns (uint) {
    return lastWinNumber;
  }

  function getTotalCalls() public constant returns (uint) {
    return totalCalls;
  }

  function getTotalBetValue() public constant returns (uint) {
    return totalBetValue;
  }

  function getCurrentTicket() public constant returns (uint) {
    return betMap[msg.sender].length;
  }

  function getCurrentCall() public constant returns (uint) {
    return currentCalls;
  }

  function checkMinimumBet(uint value) public view {
    require (value >= minimumBet);
  }

  function checkNumberBet(uint number) public pure {
    require (number >= 1 && number <= 10);
  }

  function checkTicketsPick(address target) public view {
    require (betMap[target].length <= MAX_TICKETS);
  }

  function () payable public {}

  function pickNumber(uint number) public payable {
    checkNumberBet(number);
    checkMinimumBet(msg.value);
    checkTicketsPick(msg.sender);
    
    betMap[msg.sender].push (number);
    totalBetValue += msg.value;
    addAddressToPickers(msg.sender);
    currentCalls += 1;
    
    if (currentCalls >= totalCalls) {
      LogString("Generate Result!");
      generateNumberWinner();
    }
  }

   /// @notice Generates a random number between 1 and 10 both inclusive.
   /// Must be payable because oraclize needs gas to generate a random number.
   /// Can only be executed when the game ends.
   function generateNumberWinner() payable {
      uint numberRandomBytes = 7;
      uint delay = 0;
      uint callbackGas = 200000;
      bytes32 queryId = oraclize_newRandomDSQuery(delay, numberRandomBytes, callbackGas);
   }

   /// @notice Callback function that gets called by oraclize when the random number is generated
   /// @param _queryId The query id that was generated to proofVerify
   /// @param _result String that contains the number generated
   /// @param _proof A string with a proof code to verify the authenticity of the number generation
   function __callback(
      bytes32 _queryId,
      string _result,
      bytes _proof
   ) oraclize_randomDS_proofVerify(_queryId, _result, _proof) 
   {
      // Checks that the sender of this callback was in fact oraclize
      assert(msg.sender == oraclize_cbAddress());
      uint winNumber = (uint(sha3(_result))%10+1);
      getWinners(winNumber);
      resetState();
   }

  function resetState() private {
    currentCalls = 0;
    totalBetValue = 0;
    for (uint i = 0; i < pickers.length; i++) {
        delete betMap[pickers[i]];
    }
    delete pickers;
  }

  function addAddressToPickers(address target) private {
      for (uint i = 0; i < pickers.length; i++) {
        if (pickers[i] == target) {
          return;
        }
      }

      pickers.push(target);
  }

  function uintToBytes(uint v) constant returns (bytes32 ret) {
    if (v == 0) {
        ret = "0";
    }else {
        while (v > 0) {
            ret = bytes32(uint(ret) / (2 ** 8));
            ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
            v /= 10;
        }
    }
    return ret;
 }

  function getWinners(uint winNumber) constant private {
    address[100] memory winnerList;
    uint winnerCount = 0;
    LogString("Winnumber");
    LogNumber(winNumber);
    lastWinNumber = winNumber;
    
    for (uint i = 0; i < pickers.length; i++) {
        address pickerAddress = pickers[i];
        uint[] storage numberPicks = betMap[pickerAddress];
        for (uint j = 0; j < numberPicks.length; j++) {
          if (winNumber == numberPicks[j]) {
             winnerList[winnerCount] = pickerAddress;
             winnerCount ++;
             break;
          }  
        }
    }

    if (winnerCount == 0) {
      LogString("No Winner");
      return;
    }

    LogString("We have Winners");
    uint moneyReturn = totalBetValue / winnerCount;
    LogString("Money returns");
    LogNumber(moneyReturn);

    for (uint k = 0; k < winnerCount; k++) {
      LogAddress(winnerList[k]);
      transferMoneyToWinner(winnerList[k], moneyReturn);
    }
  }

  function transferMoneyToWinner(address winner, uint moneyReturn) private {
        winner.transfer(moneyReturn);
  }

  function random() private view returns (uint) { 
    return uint8(uint256(keccak256(block.timestamp, block.difficulty))%10);   
  }

  function kill() public {
      if (msg.sender == owner) { 
        selfdestruct(owner);
      }
  }

}
