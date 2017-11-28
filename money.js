//include file system module
var fs = require('fs');

//include config file
var config = require('./config');
//include other includes
eval(fs.readFileSync('api.js') + '');

var wallets = [
	//'014496452bee390f97271E93aA802e5f9a4d7839',
	'e0168175aD34D18AA06358Ab95334B65ef533C1b',
];

for (var i = 0; i < wallets.length; i++) {
   sendMoney(wallets[i], function(){
	console.log('Success sent to ' + wallets[i]);
   });
}
