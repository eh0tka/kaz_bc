var Web3 = require('web3');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;

var web3 = new Web3(
    new Web3.providers.HttpProvider('https://rinkeby.infura.io/')
);

var address = '0x7E781ff631D8D181727fAE310c7549839c0391e5';
var key = '58d461b4201679ee19710e75b5113115318defdc1c5532e76f404a3523ff19a3';

var bytecode = 
'6060604052341561000f57600080fd5b60405160208061093983398101604052808051906020019091905050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060018060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001819055508060ff166002816100e491906100eb565b505061013e565b815481835581811511610112578183600052602060002091820191016101119190610117565b5b505050565b61013b91905b80821115610137576000808201600090555060010161011d565b5090565b90565b6107ec8061014d6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680635c19a95c1461005e578063609ff1bd146100975780639e7b8d61146100c6578063b3f98adc146100ff57600080fd5b341561006957600080fd5b610095600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610125565b005b34156100a257600080fd5b6100aa610478565b604051808260ff1660ff16815260200191505060405180910390f35b34156100d157600080fd5b6100fd600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919050506104f6565b005b341561010a57600080fd5b610123600480803560ff169060200190919050506105f3565b005b600080600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002091508160010160009054906101000a900460ff161561018557610473565b5b600073ffffffffffffffffffffffffffffffffffffffff16600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160029054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141580156102b357503373ffffffffffffffffffffffffffffffffffffffff16600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160029054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614155b1561032257600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160029054906101000a900473ffffffffffffffffffffffffffffffffffffffff169250610186565b3373ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561035b57610473565b60018260010160006101000a81548160ff021916908315150217905550828260010160026101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090508060010160009054906101000a900460ff161561045b57816000015460028260010160019054906101000a900460ff1660ff1681548110151561043b57fe5b906000526020600020900160000160008282540192505081905550610472565b816000015481600001600082825401925050819055505b5b505050565b6000806000809150600090505b6002805490508160ff1610156104f1578160028260ff168154811015156104a857fe5b90600052602060002090016000015411156104e45760028160ff168154811015156104cf57fe5b90600052602060002090016000015491508092505b8080600101915050610485565b505090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614158061059e5750600160008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff165b156105a8576105f0565b60018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001819055505b50565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090508060010160009054906101000a900460ff168061065b57506002805490508260ff1610155b156106da577f2ae066e518d3f33d6be9b01aa739c7e25bcbe8b0a525a26210e01f52dd4d78f360006040518080602001831515151581526020018281038252600e8152602001807f566f746520726573756c742069730000000000000000000000000000000000008152506020019250505060405180910390a16107bc565b7f2ae066e518d3f33d6be9b01aa739c7e25bcbe8b0a525a26210e01f52dd4d78f360016040518080602001831515151581526020018281038252600e8152602001807f566f746520726573756c742069730000000000000000000000000000000000008152506020019250505060405180910390a160018160010160006101000a81548160ff021916908315150217905550818160010160016101000a81548160ff021916908360ff160217905550806000015460028360ff168154811015156107a057fe5b9060005260206000209001600001600082825401925050819055505b50505600a165627a7a723058209ce8f59c58696aa45ce73b20c8333f5445d5d63f5dc0c23a303a8e2a9631fd4d0029';
var interface = 
[{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"delegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"winningProposal","outputs":[{"name":"_winningProposal","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"toVoter","type":"address"}],"name":"giveRightToVote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"toProposal","type":"uint8"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_numProposals","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"","type":"string"},{"indexed":false,"name":"_result","type":"bool"}],"name":"TransferData","type":"event"}];

function sendRaw(rawTx) {
    var privateKey = new Buffer(key, 'hex');
    var transaction = new tx(rawTx);
    transaction.sign(privateKey);
    var serializedTx = transaction.serialize().toString('hex');
    web3.eth.sendRawTransaction(
    '0x' + serializedTx, function(err, result) {
        if(err) {
            return err;
        } else {
            return result;
        }
    });
}

var rawTx = {
    nonce: web3.toHex(web3.eth.getTransactionCount(address)),
    gasLimit: web3.toHex(800000),
    gasPrice: web3.toHex(20000000000),
    data: '0x' + bytecode + '0000000000000000000000000000000000000000000000000000000000000005'
};

//sendRaw(rawTx);

var contractAddress = '0xDd5d173Fb6D66fde3E556f4b74be8fB42A9500B0';
var txOptions = {
    nonce: web3.toHex(web3.eth.getTransactionCount(address)),
    gasLimit: web3.toHex(800000),
    gasPrice: web3.toHex(20000000000),
    to: contractAddress
}
var rawTx = txutils.functionTx(interface, 'vote', [4], txOptions);

sendRaw(rawTx);

var contract = web3.eth.contract(interface);
var instance = contract.at(contractAddress);
/*instance.winningProposal.call(function(err, result) {
    if(err) {
        console.log(err);
    } else {
        console.log(result);
    }
});*/
