pragma solidity ^0.4.18;

contract VirtLotto {
  
  address public owner;

  mapping (address => uint[]) betMap;

  address[] pickers;

  uint minimumBet;

  uint totalCalls;

  uint totalBetValue;

  uint currentCalls;

  uint8 MAX_TICKETS = 4;

  function VirtLotto(uint _minimumBet, uint _totalCalls) public {
    owner = msg.sender;
    minimumBet = _minimumBet;
    totalCalls = _totalCalls;
  }

  function checkMinimumBet(uint bet) public view {
    require(bet >= minimumBet);
  }

  function checkNumberBet(uint number) public pure {
    require (number >= 1 && number <= 10);
  }

  function checkTicketsPick(address target) public view {
    require (betMap[target].length < MAX_TICKETS);
  }

  function () payable private {}

  function pickNumber(uint number) payable public {
    checkNumberBet(number);
    checkMinimumBet(msg.value);
    checkTicketsPick(msg.sender);

    this.transfer(msg.value); // this represent for contract address pointer. Transfer means we subtract amount of caller.`
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
