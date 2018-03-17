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
      numberOfBets: 0,
      minimumBet: 0,
      totalBet: 0,
      currentTickets: 0,
    }
  }

  voteNumber(number, cb) {
    console.log(number)
    let bet = this.refs['ether-bet'].value
    if (!bet) bet = 0.1

    if (parseFloat(bet) < this.state.minimumBet) {
      alert('You must bet more than the minimum')
      this.removeOtherNumberSelected();
    } else {
      this.state.ContractInstance.bet(number, {
        gas: 300000,
        from: this.state.web3.eth.accounts[0],
        value: this.state.web3.toWei(bet, 'finney')
      }, (err, result) => {
        this.removeOtherNumberSelected();
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

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })
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
      //this.state.ContractInstance = instance;
    })
  }

  // Listen for events and executes the voteNumber method
  setupListeners() {
    let liNodes = this.refs.numbers.querySelectorAll('li')
    liNodes.forEach(number => {
      number.addEventListener('click', event => {
        event.target.className = 'number-selected'
        this.voteNumber(parseInt(event.target.innerHTML), done => {

          // Remove the other number selected
          for (let i = 0; i < liNodes.length; i++) {
            liNodes[i].className = ''
          }
        })
      })
    })
  }

  voteNumber(number, cb) {
    let bet = this.refs['ether-bet'].value

    if (!bet) bet = 0.1

    if (parseFloat(bet) < this.state.minimumBet) {
      alert('You must bet more than the minimum')
      cb()
    } else {
      this.state.ContractInstance.pickNumber(number, {
        gas: 300000,
        from: this.state.web3.eth.accounts[0],
        value: this.state.web3.toWei(bet, 'finney')
      }, (err, result) => {
        cb()
      })
    }
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
          <b>Number of bets:</b> &nbsp;
            <span>{this.state.numberOfBets}</span>
        </div>

        <div className="block">
          <b>Last number winner:</b> &nbsp;
            <span>{this.state.lastWinner}</span>
        </div>

        <div className="block">
          <b>Total finney bet:</b> &nbsp;
            <span>{this.state.totalBet} finney</span>
        </div>

        <div className="block">
          <b>Minimum bet:</b> &nbsp;
            <span>{this.state.minimumBet} finney</span>
        </div>

        <div className="block">
          <b>Available Tickets:</b> &nbsp;
            <span>{4 - this.state.currentTickets}</span>
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
