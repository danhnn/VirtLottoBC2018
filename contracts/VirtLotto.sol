pragma solidity ^0.4.18;

contract VirtLotto {
  
  address public owner;

  mapping (address => uint[]) betMap;

  address[] pickers;

  uint public minimumBet;

  uint public totalCalls;

  uint public totalBetValue;

  uint public currentCalls;

  uint8 MAX_TICKETS = 4;

  event LogData(
        uint _value
  );

  function VirtLotto(uint _minimumBet, uint _totalCalls) public {
    owner = msg.sender;
    minimumBet = _minimumBet;
    totalCalls = _totalCalls;
  }

  function getMinimumBet() public constant returns (uint) {
    return minimumBet;
  }

  function getTotalCalls() public constant returns (uint) {
    return totalCalls;
  }

  function getTotalBetValue() public constant returns (uint) {
    return totalBetValue;
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
    require (betMap[target].length < MAX_TICKETS);
  }

  function () payable public {}

  function pickNumber(uint number) public payable {
    LogData(number);

    checkNumberBet(number);
    checkMinimumBet(msg.value);
    checkTicketsPick(msg.sender);
    
    //this.transfer(msg.value); // this represent for contract address pointer. Transfer means we subtract amount of caller.`
    betMap[msg.sender].push (number);
    totalBetValue += number;
    addAddressToPickers(msg.sender);

    currentCalls += 1;
    
    if (currentCalls == totalCalls) {
      getWinners();
      resetState();
    }
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

  function getWinners() constant private {
    address[100] memory winnerList;
    uint winNumber = random();
    uint winnerCount = 0;

    for (uint i = 0; i < pickers.length; i++) {
        address pickerAddress = pickers[i];
        uint[] storage numberPicks = betMap[pickerAddress];
        for (uint j = 0; j < numberPicks.length; j++) {
          if (winNumber == numberPicks[i]) {
             winnerList[winnerCount] = pickerAddress;
             winnerCount ++;
             break;
          }  
        }
    }

    if (winnerCount == 0)
      return;

    uint moneyReturn = totalBetValue / winnerCount;
    for (uint k = 0; k < winnerCount; k++) {
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
