import React, { Component } from 'react'
import VirtLottoContract from '../build/contracts/VirtLotto.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      lastWinner: 0,
      totalCalls: 0,
      minimumBet: 0,
      totalBet: 0,
      currentCalls: 0,
    }
  }

  voteNumber(number) {
    console.log("Vote for: ",number)
    let bet = this.refs['ether-bet'].value
    if (!bet) bet = 0.1

    if (parseFloat(bet) < this.state.minimumBet) {
      alert('You must bet more than the minimum')
      this.removeOtherNumberSelected();
    } else {
      const address = this.state.web3.eth.accounts[0];
      const etherBet = this.state.web3.toWei(bet, 'ether')
      console.log("Address = ",this.state.web3.eth.accounts[0])
      console.log("Bet = ",bet)
      this.state.ContractInstance.pickNumber(number, {
        from: address,
        value: etherBet
      }).then((result) => {
        console.log("pick result = ", result)
        
        this.removeOtherNumberSelected();
      }).catch((error) => {
        console.log("pick error = ", error)
      })
    }
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
    setInterval(this.updateState.bind(this), 10e3)
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
        this.state.web3.eth.defaultAccount = this.state.web3.eth.accounts[0]
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
        ContractInstance : instance
      })
      this.watchEvents();
      this.updateState()
    })
  }

  watchEvents() {
    let event = this.state.ContractInstance.LogData();
    // watch for changes
    event.watch(function(error, result){
        // result will contain various information
        // including the argumets given to the Deposit
        // call.
        if (!error)
            console.log("Log data = ", result.args._value.toString());
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

  render() {
    return (
      <div className="main-container">
        <h1>Bet for your best number and win huge amounts of Ether</h1>

        <div className="block">
          <b>Total Calls:</b> &nbsp;
            <span>{this.state.totalCalls}</span>
        </div>

        <div className="block">
          <b>Current calls:</b> &nbsp;
            <span>{this.state.currentCalls}</span>
        </div>

        <div className="block">
          <b>Last number winner:</b> &nbsp;
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

        <hr />

        <h2>Vote for the next number</h2>

        <label>
          <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet} /></b> ether
            <br />
        </label>

        <ul ref="numbers">
          {
            this.renderNumber()
          }
        </ul>
      </div>
    )
  }
}

export default App
