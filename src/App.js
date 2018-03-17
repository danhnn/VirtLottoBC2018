import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
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
      timer: 0
    }
  }

  voteNumber(number) {
    console.log(number)
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
        //this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        simpleStorageInstance = instance
        // Stores a given value, 5 by default.
        return simpleStorageInstance.set(5, { from: accounts[0] })
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })
    })
  }

  render() {
    return (
      <div className="main-container">
        <h1>Bet for your best number and win huge amounts of Ether</h1>

        <div className="block">
          <h4>Timer:</h4> &nbsp;
            <span ref="timer"> {this.state.timer}</span>
        </div>

        <div className="block">
          <h4>Last winner:</h4> &nbsp;
            <span ref="last-winner">{this.state.lastWinner}</span>
        </div>

        <hr />

        <h2>Vote for the next number</h2>
        <ul>
          <li onClick={() => { this.voteNumber(1) }}>1</li>
          <li onClick={() => { this.voteNumber(2) }}>2</li>
          <li onClick={() => { this.voteNumber(3) }}>3</li>
          <li onClick={() => { this.voteNumber(4) }}>4</li>
          <li onClick={() => { this.voteNumber(5) }}>5</li>
          <li onClick={() => { this.voteNumber(6) }}>6</li>
          <li onClick={() => { this.voteNumber(7) }}>7</li>
          <li onClick={() => { this.voteNumber(8) }}>8</li>
          <li onClick={() => { this.voteNumber(9) }}>9</li>
          <li onClick={() => { this.voteNumber(10) }}>10</li>
        </ul>
      </div>
    )
  }
}

export default App
