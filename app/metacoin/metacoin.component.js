import metacoinHtml from './metacoin.html';
import metacoinJson from './metacoin.json';
import Web3 from 'web3';
import jquery from 'jquery';
import bootstrap from 'bootstrap';

let metacoinComponent = {
	template: metacoinHtml,
	controllerAs: 'vm',
	controller: function(metacoinService, $scope, $interval, $timeout) {
		
		const vm = this;
		vm.title = metacoinService.title();

		// Connect Web3 Instance
		var web3Query = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/AyifF0rnvHClXpU46hu9"));
		var contractAbi = metacoinJson;
		var contractAddress = '0x9B78e854A6c18f7a2Db9736C9f5404568a9b8Da4';
		var contract = web3.eth.contract(contractAbi).at(contractAddress);
		
		var pending = (txn) => {
			vm.status = 'Pending TXN';
			vm.currentTxn = txn;
			vm.linkTxn = `https://ropsten.etherscan.io/tx/${txn}`;
			var pendingInterval;
			pendingInterval = $interval(()=>{
				if (!web3Query.eth.getTransactionReceipt(txn)) {
					console.log('pending...')	
				} else {
					vm.status = 'TXN in blockchain';
					$timeout(()=>{
						getContractBalance();
					},1000)
					$interval.cancel(pendingInterval);
				}
			},1000)
		}

		var init = () => {
			getChairpersonAddress();
			getContractBalance();
		}
		
		// SETTERS
		vm.sendEthToContract = () => {
			contract.sendEthToContract.sendTransaction({
        from: web3.eth.accounts[0],
        value: web3.toWei(.01, 'ether')
      }, function(err, result) {
        if (!err) {
        	pending(result);
        } else {
          console.log(err);
        }
      })
		}

		vm.sendContractEthToChairperson = () => {
			contract.sendContractEthToChairperson.sendTransaction({
        from: web3.eth.accounts[0]
      }, function(err, result) {
        if (!err) {
        	pending(result);
        } else {
          console.log(err);
        }
      })
		}

		
		// GETTERS
		var getChairpersonAddress = () => {
			contract.getChairpersonAddress.call((err, result) => {
				if(!err) {
					// console.log(result)
					vm.chairpersonAddress = result;
				} else {
					// console.log(err);
					vm.chairpersonAddress = err;
				}
				$scope.$apply();
			});
		}

		var getContractBalance = () => {
			contract.getContractBalance.call((err, result) => {
				if(!err) {
					// console.log(web3.fromWei(result, 'ether').toNumber());
					vm.contractBalance = `${web3.fromWei(result, 'ether').toNumber()} ETH`;
				} else {
					// console.log(err);
					vm.contractBalance = err;
				}
				$scope.$apply();
			});
		}

		init();

	}

}


export default metacoinComponent;
