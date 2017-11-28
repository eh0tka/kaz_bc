//include file system module
var fs = require('fs');

//include config file
var config = require('./config');
//include other in
eval(fs.readFileSync('include.js') + '');

var contract = web3.eth.contract(config.contractAbi);

var contractData = contract.new.getData(["Putin","Trump","Nazarbaev","Antosha"], {
	data: '0x' + config.contractByteCode
});

var rawTx = {
    nonce: web3.toHex(web3.eth.getTransactionCount(config.address)),
    gasLimit: web3.toHex(800000),
    gasPrice: web3.toHex(20000000000),
    data: contractData
};


sendRaw(config.key, rawTx, function(err, result){
    if(err) {
        console.log(err);
    } else {
        console.log("Got transaction address: " + result);
        waitDeploy(result);
    }
});
