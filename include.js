//include all required dependencies
var Web3 = require('web3');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;

var web3 = new Web3(
    new Web3.providers.HttpProvider('https://rinkeby.infura.io/')
);

//sign transactinon with a private key and send to Ethereum blockchain
function sendRaw(key, rawTx, callBack) {
    var privateKey = new Buffer(key, 'hex');
    var transaction = new tx(rawTx);
    transaction.sign(privateKey);
    var serializedTx = transaction.serialize().toString('hex');
    web3.eth.sendRawTransaction(
    '0x' + serializedTx, function(err, result) {
        callBack(err, result);
    });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// We need to wait until any miner has included the transaction
// in a block to get the address of the contract
async function waitDeploy(transactionHash) {
  while (true) {
    let receipt = web3.eth.getTransactionReceipt(transactionHash);
    if (receipt && receipt.contractAddress) {
      console.log("Your contract has been deployed at https://rinkeby.etherscan.io/address/" + receipt.contractAddress);
      console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
      break;
    }
    console.log("Waiting a mined block to include your contract... currently in block " + web3.eth.blockNumber);
    await sleep(4000);
  }
}

// We need to wait until any miner has included the transaction
async function waitTransaction(transactionHash) {
  while (true) {
    let receipt = web3.eth.getTransactionReceipt(transactionHash);
    if (receipt) {
      console.log("Transaction confirmed");
      console.log(receipt);
      break;
    }
    console.log("Waiting a mined block to include your transaction... currently in block " + web3.eth.blockNumber);
    await sleep(4000);
  }
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


