// Config
global.config = {
  rpc: {
    host: "localhost",
    port: "8545"
  }
}

// Load Libraries
global.solc = require("solc")
global.fs = require("fs")
global.EthTx = require("ethereumjs-tx")
global.Web3 = require("web3")

// Connect Web3 Instance
global.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/AyifF0rnvHClXpU46hu9"));
global.contractAbi = [{"constant":true,"inputs":[],"name":"getContractBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"sendEthToContract","outputs":[{"name":"","type":"uint256"}],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"getChairpersonAddress","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"sendContractEthToChairperson","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}];
global.contractAddress = '0x9B78e854A6c18f7a2Db9736C9f5404568a9b8Da4';
global.contract = web3.eth.contract(contractAbi).at(contractAddress);
// Global Account Accessors
global.acct1 = "0x85f4f57507d8eeEa0447F855866656F3DC10DDf2"
global.acct2 = "0xD2C8a7C6c14f185095AA1147D313b9be5a542041"
global.acct3 = web3.eth.accounts[2]
global.acct4 = web3.eth.accounts[3]
global.acct5 = web3.eth.accounts[4]

// Helper Functions
class Helpers {

  contractName(source) {
    var re1 = /contract.*{/g
    var re2 = /\s\w+\s/
    return source.match(re1).pop().match(re2)[0].trim()
  }

  createContract(source, options={}) {
    var compiled = solc.compile(source)
    var contractName = this.contractName(source)
    var bytecode = compiled["contracts"][contractName]["bytecode"]
    var abi = JSON.parse(compiled["contracts"][contractName]["interface"])
    var contract = global.web3.eth.contract(abi)
    var gasEstimate = global.web3.eth.estimateGas({ data: bytecode })

    var deployed = contract.new(Object.assign({
      from: global.web3.eth.accounts[0],
      data: bytecode,
      gas: gasEstimate,
      gasPrice: 5
    }, options), (error, result) => { })

    return deployed
  }

  loadContract(name) {
    var path = `./${name.toLowerCase()}.sol`
    return fs.readFileSync(path, 'utf8')
  }

  deployContract(name, options={}) {
    var source = this.loadContract(name)
    return this.createContract(source, options)
  }

  etherBalance(contract) {
    switch(typeof(contract)) {
      case "object":
        if(contract.address) {
          return global.web3.fromWei(global.web3.eth.getBalance(contract.address), 'ether').toNumber()
        } else {
          return new Error("cannot call getEtherBalance on an object that does not have a property 'address'")
        }
        break
      case "string":
        return global.web3.fromWei(global.web3.eth.getBalance(contract), 'ether').toNumber()
        break
    }
  }

}

// Load Helpers into Decypher namespace
global.decypher = new Helpers()

// Start repl
require('repl').start({})
