//include file system module
var fs = require('fs');

//include config file
var config = require('./config');
//include other includes
eval(fs.readFileSync('include.js') + '');

var contract = web3.eth.contract(config.contractAbi);
var instance = contract.at(config.contractAddress);

/**
 * Fetch total number of candidates for voting
*/
function getTotalCandidates() {
   var data = instance.getCandidateCount.call();
   return data.toNumber();
}

/**
 * Fetch information without candidate with arbitrary number
*/
function getCandidateInfo(num) {
   var data = instance.getCandidate.call(num);
   var name = web3.toAscii(data[0]).replace(/\u0000/g, '');
   return {
      name: name,
      votes: data[1].toNumber()
   };
}

/**
 * Fetch all candidate names and voting numbers
*/
function getAllCandidatesInfo() {
   var candidatesNum = getTotalCandidates();
   var result = [];
   for (var i = 0; i < candidatesNum; i++) {
      result.push({
          num: i+1,
          info: getCandidateInfo(i)
      });
   }
   return result;
}

/**
 * Fetch information about my candidate number I already voted
*/
function whomIVoted() {
   var data = instance.whomIVoted.call({ from: config.address });
   return data.toNumber() + 1;
}

/**
 * Fetch winner name
*/
function getWinnerName() {
   var data = instance.winnerName.call({ from: config.address });
   var name = web3.toAscii(data.toString()).replace(/\u0000/g, '');
   return name;
}

/**
 * Fetch current user voting data
*/
function getVotingData(userData) {
   var address = config.address;
   if (userData) {
      address = userData.address;
   }
   var data = instance.getVotingData.call({ from: address });
   return {
      voted: data[0],
      votedFor: data[1].toNumber(),
      address: data[2].toString()
   };
}

/**
 * Vote for someone
*/
function vote(num, userData, callBack) {
  if (!userData) {
     var userAddress = config.address;
     var userKey = config.key; 
  } else {
     var userAddress = userData.address;
     var userKey = userData.key; 
  }
  var txOptions = {
    nonce: web3.toHex(web3.eth.getTransactionCount(userAddress)),
    gasLimit: web3.toHex(800000),
    gasPrice: web3.toHex(20000000000),
    to: config.contractAddress
  }
  var rawTx = txutils.functionTx(config.contractAbi, 'vote', [num-1], txOptions);
  sendRaw(userKey, rawTx, callBack);
}

/**
 * Send money to some address to make it possible to use our system
 * for instance, on registration
*/ 
function sendMoney(to, callBack) {

  console.log('to');
  var address = config.address;
  var rawTx = {
    nonce: web3.toHex(web3.eth.getTransactionCount(address)),
    gasLimit: web3.toHex(21000),
    gasPrice: web3.toHex(web3.eth.gasPrice),
    to: '0x' + to,
    value: web3.toHex(web3.toBigNumber(web3.eth.getBalance(address)/50)
          .minus(web3.toBigNumber(21000).times(20000000000)))
  };

  console.log("Sending money from " + address + " with params ");
  console.log(rawTx);

  sendRaw(config.key, rawTx, function(err, result) {
    if(err) {
      console.log(err);
    } else {
      confirmMoneySend(result, callBack);
    }
  });
}

async function confirmMoneySend(transactionHash, callBack) {
  while (true) {
    let receipt = web3.eth.getTransactionReceipt(transactionHash);
    if (receipt) {
      console.log("Money sending confirmed");
      console.log(receipt);
      callBack(transactionHash);
      break;
    }
    console.log("Waiting a mined block to include your sendMoney... currently in block " + web3.eth.blockNumber);
    await sleep(4000);
  }
}
