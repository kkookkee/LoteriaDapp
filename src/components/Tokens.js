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

  _balanceTokens = async () => {
    try {
      console.log('Executing balanceof')
      const balanceof = await this.state.contract.methods.balance_tokens(this.state.account).call()
      console.log('tokens ',balanceof);
      Swal.fire({
        icon:'info',
        title: 'Balance de tokens del usuario',
        width:800,
        padding:'3em',
        text: `${balanceof}`,
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

  _balanceTokensSM = async () => {
    try {
      console.log('Executing balanceof sm')
      const balanceof = await this.state.contract.methods.balance_contract().call()
      console.log('tokens ',balanceof);
      Swal.fire({
        icon:'info',
        title: 'Balance de tokens del SM',
        width:800,
        padding:'3em',
        text: `${balanceof}`,
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

  _balanceEthersSM = async () => {
    try {
      console.log('Executing balanceof sm')
      const balanceof = await this.state.contract.methods.verEthersSM().call()
      console.log('tokens ',balanceof);
      Swal.fire({
        icon:'info',
        title: 'Balance de ethers del SM',
        width:800,
        padding:'3em',
        text: `${balanceof}`,
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

  _buyTokens = async(_amount) => {
    try {
      console.log('Executing buyTokens, amount: ',_amount)
      const web3 = window.web3
      const eth = web3.utils.toWei(this._amount.value,'ether')
      console.log('eth wei to send ', eth);
      await this.state.contract.methods.compraTokens(_amount).send({
        from:this.state.account,
        value: eth
      })
      Swal.fire({
        icon:'success',
        title: 'Compra de tokens realizada',
        width:800,
        padding:'3em',
        text: `Has comprado ${_amount}`,
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

  _returnTokens = async(_amount) => {
    try {
      console.log('Executing return tokens, amount: ',_amount)
      const web3 = window.web3
      await this.state.contract.methods.devolverTokens(_amount).send({
        from:this.state.account
      })
      Swal.fire({
        icon:'success',
        title: 'Devolucion de tokens',
        width:800,
        padding:'3em',
        text: `${_amount} tokens devueltos`,
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
  _buyTickets = async(_amount) => {
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
  
  render() {
    return (
      <div>
        <Navigation account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Gestion de tokens ERC20</h1>
                &nbsp;
                <Container>
                  <Row>
                    <Col>
                      <h3> Tokens usuario </h3>
                        <form onSubmit={(e)=>{
                          e.preventDefault()
                          this._balanceTokens()
                        }}>
                        <input type='submit' className='btn btn-block btn-success btn-sm' value='ver balance'></input>
                      </form>
                    </Col>
                    <Col>
                      <h3> Tokens SC </h3>
                      <form onSubmit={(e)=>{
                        e.preventDefault()
                        this._balanceTokensSM()
                      }}>
                      <input type='submit' className='btn btn-block btn-success btn-sm' value='ver balance'></input>
                      </form>
                    </Col>
                    <Col>
                      <h3> Ethers SC </h3>
                      <form onSubmit={(e)=>{
                        e.preventDefault()
                        this._balanceEthersSM()
                      }}>
                      <input type='submit' className='btn btn-block btn-success btn-sm' value='ver balance'></input>
                      </form>
                    </Col>
                  </Row>
                </Container>
                &nbsp;
                <h3> Compra de tokens </h3>
                  <form onSubmit={(e)=>{
                    e.preventDefault()
                    this._buyTokens(this._amount.value)
                  }}>
                  <input type='number' className='form-control mb-1' ref={(input)=>this._amount = input}></input>
                  <input type='submit' className='btn btn-block btn-success btn-sm' value='Compra tokens'></input>
                  </form>
              <h3> Devolucion de tokens </h3>
                <form onSubmit={(e)=>{
                  e.preventDefault()
                  this._returnTokens(this._amountReturn.value)
                }}>
                <input type='number' className='form-control mb-1' ref={(input)=>this._amountReturn = input}></input>
                <input type='submit' className='btn btn-block btn-success btn-sm' value='Devolver tokens'></input>
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
