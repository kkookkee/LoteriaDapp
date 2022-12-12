import React, { Component } from 'react';
import smart_contract from '../abis/loteria.json';
import Web3 from 'web3';
import logo from '../logo.png';
import Swal from 'sweetalert2';
import { Row,Col, Container } from 'react-bootstrap';

import Navigation from './Navbar';

class Tokens extends Component {

  async componentDidMount() {
    // 1. Carga de Web3
    await this.loadWeb3()
    // 2. Carga de datos de la Blockchain
    await this.loadBlockchainData()
  }

  // 1. Carga de Web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts: ', accounts)
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('¡Deberías considerar usar Metamask!')
    }
  }

  // 2. Carga de datos de la Blockchain
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Ganache -> 5777, Rinkeby -> 4, BSC -> 97
    const networkId = await web3.eth.net.getId() 
    console.log('networkid:', networkId)
    const networkData = smart_contract.networks[networkId]
    console.log('NetworkData:', networkData)

    if (networkData) {
      const abi = smart_contract.abi
      console.log('abi', abi)
      const address = networkData.address
      console.log('address:', address)
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
    } else {
      window.alert('¡El Smart Contract no se ha desplegado en la red!')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      loading: true,
      errorMessage: ''
    }
  }

  
  _getWinner = async(_amount) => {
    try {
      console.log('Executing buy tickets, amount: ',_amount)
      await this.state.contract.methods.compraBoletos(_amount).send({
        from:this.state.account
      })
      Swal.fire({
        icon:'success',
        title: 'Compra de boletos',
        width:800,
        padding:'3em',
        text: `Has comprado ${_amount} boletos`,
        backdrop: `
          rgba(15,238,168,0.2)
          left top
          no-repeat
        `
      })
    } catch (error) {
      this.setState({errorMessage:error})
    } finally {
      this.setState({loading: false})
    }
  }

  _getWinner = async() => {
    try {
        await this.state.contract.methods.generarGanador().send({
            from:this.state.account
        })
        const inf = await this.state.contract.methods.ganador().call()
      Swal.fire({
        icon:'success',
        title: 'Ganador de la loteria',
        width:800,
        padding:'3em',
        text: `El ganador es: ${inf}`,
        backdrop: `
          rgba(15,238,168,0.2)
          left top
          no-repeat
        `
      })
    } catch (error) {
      this.setState({errorMessage:error})
    } finally {
      this.setState({loading: false})
    }
  }
  
  render() {
    return (
      <div>
        <Navigation account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <h1>Gestion de loteria</h1>

              <h3> Generar un ganador de la loteria </h3>
                <form onSubmit={(e)=>{
                  e.preventDefault()
                  this._getWinner()
                }}>
                <input type='submit' className='btn btn-block btn-success btn-sm' value='Ver ganador'></input>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default Tokens;
