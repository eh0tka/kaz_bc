//include file system module
var fs = require('fs');

//include other includes
eval(fs.readFileSync('api.js') + '');

//include config file
var config = require('./config');

console.log("Calling contract at address: " + config.contractAddress)
console.log("------------------");

//console.log(instance.candidates.call(0)); 
//console.log(instance.voters.call(config.address)); 

console.log("Total candidates for now: " + getTotalCandidates());
console.log("Info about all candidates: ");
console.log(getAllCandidatesInfo());

var votingData = getVotingData();
console.log("My voting data:");
console.log(votingData);

//check whom I voted
var myCandidateNum = whomIVoted();
var isVoted = votingData.voted;

console.log("Am I voted?");
console.log(isVoted + " (" + myCandidateNum + ")");

//if already - show the name and try to compromise the system
if (isVoted) {
    console.log("Whom I voted?");
    console.log(getCandidateInfo(myCandidateNum-1));
    console.log("I am voting for candidate 1 now");
    vote(1, null, votingCallBack)
} else {
   console.log("I am voting for candidate 4");
   vote(4, null, votingCallBack)
}

console.log("The current candidate winner name is: ", getWinnerName());

function votingCallBack(err, result) {
  if(err) {
      console.log(err);
  } else {
      console.log("Got VOTE transaction address: " + result);
      waitTransaction(result);
  }
}