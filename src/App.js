import React, { Component } from 'react'
import VirtLottoContract from '../build/contracts/VirtLotto.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
import SweetAlert from 'react-bootstrap-sweetalert';
import background from "./images/background.jpg";

class App extends Component {

  INIT_STATE = {
    web3: null,
    lastWinner: 0,
    totalCalls: 0,
    minimumBet: 0,
    totalBet: 0,
    currentCalls: 0,
    currentTicket: 0,
    numbersChoose: [],
    isShowAlert: false,
    alertBoxType: 'success',
    alertBoxTitle: '',
    alertBoxContent:'',
  }


  constructor(props) {
    super(props)
    this.state = this.INIT_STATE;
  }

  voteNumber(number) {
    console.log("Vote for: ", number)
    let bet = this.refs['ether-bet'].value
    if (!bet) bet = 0.1

    if (this.state.currentTicket >= 4) {
      this.setState({
        isShowAlert: true,
        alertBoxType: 'warning',
        alertBoxTitle: 'Warning!',
        alertBoxContent:'Maximum tickets is 4! You are out of tickets!',
      })
      return;
    }

    if (parseFloat(bet) < this.state.minimumBet) {
      this.setState({
        isShowAlert: true,
        alertBoxType: 'warning',
        alertBoxTitle: 'Warning!',
        alertBoxContent:'You must bet more than the minimum',
      })
      //alert('You must bet more than the minimum')
      this.removeOtherNumberSelected();
    } else {
      const address = this.state.web3.eth.accounts[0];
      const etherBet = this.state.web3.toWei(bet, 'ether')
      console.log("Address = ", this.state.web3.eth.accounts[0])
      console.log("Bet = ", bet)
      this.state.numbersChoose.push(number);

      this.state.ContractInstance.pickNumber(number, {
        from: address,
        gas: 400000,
        value: etherBet
      }).then((result) => {
        console.log("pick result = ", result)
        this.checkWin();
        this.removeOtherNumberSelected();
      }).catch((error) => {
        console.log("pick error = ", error)
      })
    }
  }

  checkWin() {
    console.log("Current calls = ", this.state.currentCalls);
    console.log("total calls = ", this.state.totalCalls);
    if (this.state.currentCalls === this.state.totalCalls - 1) {
      this.state.ContractInstance.getLastWinNumber.call().then((result) => {
        if (result != null) {
          const winnum = parseInt(result);
          if (this.state.numbersChoose.includes(winnum)) {
            let str = "Winning Number is " + winnum + "! Congratulation! You Win!!!";
            this.setState({
              isShowAlert: true,
              alertBoxType: 'success',
              alertBoxTitle: 'You Win!',
              alertBoxContent: str,
            })
          } else {
            let str = "Winning Number is " + winnum + "! Sorry, but can try again!!!";
            this.setState({
              isShowAlert: true,
              alertBoxType: 'danger',
              alertBoxTitle: 'You Lose!',
              alertBoxContent: str,
            })
          }
          this.setState({ numbersChoose: [] });
        }
      })
    }
    this.updateState();
  }

  removeOtherNumberSelected() {
    let liNodes = this.refs.numbers.querySelectorAll('li')
    // Remove the other number selected
    for (let i = 0; i < liNodes.length; i++) {
      liNodes[i].className = ''
    }
  }

  componentDidMount() {
    this.updateState();
    setInterval(this.updateState.bind(this), 5000)
  }

  updateState() {
    if (!this.state.web3 || !this.state.ContractInstance) {
      return;
    }

    this.state.ContractInstance.getMinimumBet.call().then((result) => {
      if (result != null) {
        this.setState({
          minimumBet: parseFloat(this.state.web3.fromWei(result, 'ether'))
        })
      }
    })
    this.state.ContractInstance.getTotalBetValue.call().then((result) => {
      if (result != null) {
        this.setState({
          totalBet: parseFloat(this.state.web3.fromWei(result, 'ether'))
        })
      }
    })
    this.state.ContractInstance.getTotalCalls.call().then((result) => {
      if (result != null) {
        this.setState({
          totalCalls: parseInt(result)
        })
      }
    })
    this.state.ContractInstance.getCurrentCall.call().then((result) => {
      if (result != null) {
        this.setState({
          currentCalls: parseInt(result)
        })
      }
    })
    this.state.ContractInstance.getCurrentTicket.call().then((result) => {
      if (result != null) {
        this.setState({
          currentTicket: parseInt(result)
        })
      }
    })
    this.state.ContractInstance.getLastWinNumber.call().then((result) => {
      if (result != null) {
        this.setState({
          lastWinner: parseInt(result)
        })
      }
    })
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })
        // Don't know why to set defaul account here
        //this.state.web3.eth.defaultAccount = this.state.web3.eth.accounts[0]
        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const virtLotto = contract(VirtLottoContract)
    virtLotto.setProvider(this.state.web3.currentProvider)
    virtLotto.deployed().then((instance) => {
      this.setState({
        ContractInstance: instance
      })
      this.watchEvents();
      this.updateState()
    })
  }

  watchEvents() {
    let eventString = this.state.ContractInstance.LogString();
    eventString.watch((error, result) => {
      if (!error) {
        const value = result.args.value;
        //console.log("Log String = ",value);
        console.log("Log String = ", this.state.web3.toAscii(value.replace(/\0[\s\S]*$/g, '')));
      }
    });

    let eventNumber = this.state.ContractInstance.LogNumber();
    eventNumber.watch(function (error, result) {
      if (!error)
        console.log("Log Number = ", result.args.value.toString());
    });

    let eventAddress = this.state.ContractInstance.LogAddress();
    eventAddress.watch((error, result) => {
      if (!error) {
        const value = result.args.value;
        //console.log("Log String = ",value);
        console.log("Log Address = ", value);
      }
    });
  }

  renderNumber() {
    let numbers = [];
    for (let i = 1; i <= 10; i++) {
      numbers.push(i);
    }
    return numbers.map(x => (
      <li key={x} onClick={() => { this.voteNumber(x) }}>{x}</li>
    ))
  }

  hideAlert() {
    this.setState({
      isShowAlert: false
    })
  } 

  render() {

    return (
      <div className="main-container">
        <h1>Welcome to Harry's Virtual Casino!</h1>

        <div className="block">
          <b>Total Calls:</b> &nbsp;
            <span>{this.state.totalCalls}</span>
        </div>

        <div className="block">
          <b>Current calls:</b> &nbsp;
            <span>{this.state.currentCalls}</span>
        </div>

        <div className="block">
          <b>Last win number:</b> &nbsp;
            <span>{this.state.lastWinner}</span>
        </div>

        <div className="block">
          <b>Total ether bet:</b> &nbsp;
            <span>{this.state.totalBet} ether</span>
        </div>

        <div className="block">
          <b>Minimum bet:</b> &nbsp;
            <span>{this.state.minimumBet} ether</span>
        </div>

        <div className="block">
          <b>Tickets left:</b> &nbsp;
            <span>{4 - this.state.currentTicket}</span>
        </div>

        <hr />

        <h2>Pick any number you want and start to pray :)</h2>

        <label>
          <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet} /></b> ether
            <br />
        </label>

        <ul ref="numbers">
          {
            this.renderNumber()
          }
        </ul>
        <SweetAlert show={this.state.isShowAlert} type={this.state.alertBoxType} title={this.state.alertBoxTitle} onConfirm={ () => {this.hideAlert()} }>
          {this.state.alertBoxContent}
        </SweetAlert>
      </div>
    )
  }
}

export default App
