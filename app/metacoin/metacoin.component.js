import metacoinHtml from './metacoin.html';
import Web3 from 'web3';
import util from 'ethereumjs-util';
import tx from 'ethereumjs-tx';
import lightwallet from 'eth-lightwallet';
import jquery from 'jquery';
import bootstrap from 'bootstrap';
import EscrowAbiController from '../../build/contracts/EscrowAbiController.json';

let metacoinComponent = {
	template: metacoinHtml,
	controllerAs: 'vm',
	controller: function(metacoinService, $scope, $interval) {
		
		const vm = this;
		var txutils = lightwallet.txutils;
		vm.title = metacoinService.title();

		var address = '0x85f4f57507d8eeEa0447F855866656F3DC10DDf2';
		var address2 = '0xD2C8a7C6c14f185095AA1147D313b9be5a542041';
		var key = '';
		var key2 = '';

		// Connect Web3 Instance
		var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/AyifF0rnvHClXpU46hu9"));
		var contractAbi = [{"constant":true,"inputs":[],"name":"getContractBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"sendEthToContract","outputs":[{"name":"","type":"uint256"}],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"getChairpersonAddress","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"sendContractEthToChairperson","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}];
		var contractAddress = '0x9B78e854A6c18f7a2Db9736C9f5404568a9b8Da4';
		var contract = web3.eth.contract(contractAbi).at(contractAddress);

		//
		var sendRaw = (rawTx) => {
		  var privateKey = new Buffer(key, 'hex');
		  var transaction = new tx(rawTx);
		  transaction.sign(privateKey);
		  var serializedTx = transaction.serialize().toString('hex');
		  web3.eth.sendRawTransaction(
		  '0x' + serializedTx, function(err, result) {
		    if(err) {
		        console.log(err);
		    } else {
		        console.log('success',result);
		        pending(result);
		    }
		  });
		}		
		
		var pending = (txn) => {
			vm.chairpersonAddress = 'Pending TXN';
			vm.currentTxn = txn;
			vm.linkTxn = `https://ropsten.etherscan.io/tx/${txn}`;
			var pendInt;
			pendInt = $interval(()=>{
				if (!web3.eth.getTransactionReceipt(txn)) {
					console.log('pending...')	
				} else {
					vm.chairpersonAddress = 'TXN in blockchain';
					$interval.cancel(pendInt);
				}
			},1000)
		}

		// Sending TXN
		var txOptions = {
		    nonce: web3.toHex(web3.eth.getTransactionCount(address)),
		    gasLimit: web3.toHex(80000),
		    gasPrice: web3.toHex(20000000000),
		    to: contractAddress
		}
		var txOptionsWithValue = {
		    nonce: web3.toHex(web3.eth.getTransactionCount(address)),
		    gasLimit: web3.toHex(80000),
		    gasPrice: web3.toHex(20000000000),
		    value: 110000000000000000,// web3.toWei(.11, 'ether'),
		    to: contractAddress
		}
		
		var sendEthToContract = txutils.functionTx(contractAbi, 'sendEthToContract', [], txOptionsWithValue);
		var sendContractEthToChairperson = txutils.functionTx(contractAbi, 'sendContractEthToChairperson', [], txOptions);

		// SETTERS
		vm.sendEthToContract = () => {
			console.log('txOptionsWithValue',txOptionsWithValue)
			sendRaw(sendEthToContract);
		}

		vm.sendContractEthToChairperson = () => {
			console.log('txOptions',txOptions)
			sendRaw(sendContractEthToChairperson)
		}
		
		// GETTERS
		vm.getChairpersonAddress = () => {
			contract.getChairpersonAddress.call((err, result) => {
				if(err) {
					console.log(err);
				} else {
					console.log(result);
					vm.chairpersonAddress = result;
					$scope.$apply();
				}
			});
		}
		vm.getContractBalance = () => {
			contract.getContractBalance.call((err, result) => {
				if(err) {
					console.log(err);
				} else {
					console.log(web3.fromWei(result, 'ether').toNumber())
					console.log(result);
				}
			});
		}

	}

}


export default metacoinComponent;
