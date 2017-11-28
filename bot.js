//include file system module
var fs = require('fs');

//include other includes
eval(fs.readFileSync('./api.js') + '');

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '460395470:AAEt8Cq8-lg3r2Oa1a86KSXcdofsRkH014A';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/start/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  var text = 'Что делать будем?';
 
  var keyboardStr = JSON.stringify({
      inline_keyboard: [
        [
          {text:'Голосовать!',callback_data:'vote'},
          {text:'Текущие результаты выборов',callback_data:'results'}
        ]
      ]
  });
 
  var keyboard = {reply_markup: JSON.parse(keyboardStr)};
  bot.sendMessage(msg.chat.id, text, keyboard);
});

var transactionId = '';

// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const userId = callbackQuery.from.id;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  let text; 

  transactionId = guid();

  console.log("User " + userId + " checked action " + action);

  var matches = action.match(/vote\_(\d+)/);

  //if voting is done
  if (matches) {
    var voteNum = parseInt(matches[1]);
    voteForCandidate(userId, voteNum, opts);
  } else {
      //first level chosen
      switch (action) {
        case 'vote':
          userVote(userId, opts);
          break;
        case 'results':
          voteResults(opts);
          break;
        default:
          return;
      }
  }
 
  if (text) {
    //bot.editMessageText(text, opts);
    //bot.sendMessage(msg.chat.id, text);
  }
});


//---------FUNCTION BLOCK----------------//

/**
 * User sends his vote for candidate with number voteNum
*/
function voteForCandidate(userId, voteNum, opts) {
  voteNum += 1;
  //call api method vote(num, userData, callBack)
  bot.editMessageText("Вы выбрали кандидата с номером " + (voteNum) + ", вашему запросу присвоен ID: " + transactionId, opts);
  bot.sendMessage(opts.chat_id, "[" + transactionId + "]: " + "Проверяем кошелек, ожидайте...");

  getUserKeys(userId, opts, function(userKeys) {
    userKeys.address = '0x' + userKeys.address;
    bot.sendMessage(opts.chat_id, "[" + transactionId + "]: " + "Голосуем с адреса " + userKeys.address);
    vote(voteNum, userKeys, function(err, transactionHash) {
      if(err) {
          bot.sendMessage(opts.chat_id, "[" + transactionId + "]: " + "Error occurred: " + err);
          console.log(err);
      } else {
          var initialText = "Голос отправлен за кандидата №" + voteNum + "\r\n" +
            "Транзакция: https://rinkeby.etherscan.io/tx/" + transactionHash + "\r\n";
          var waitingText = initialText + "Ожидайте результатов ...";
          bot.sendMessage(opts.chat_id, "[" + transactionId + "]: " + waitingText);

          //now wait for transaction
          confirmVote(transactionHash, initialText, opts);
      }
    });
  });
}

//async function for vote confirmation
async function confirmVote(transactionHash, initialText, opts) {
  while (true) {
      let receipt = web3.eth.getTransactionReceipt(transactionHash);
      if (receipt) {
        console.log("Transaction " + transactionHash + " confirmed");
        console.log(receipt);
        var resultText = initialText + "Статус транзакции " + receipt.status;
        bot.sendMessage(opts.chat_id, "[" + transactionId + "]: " + resultText);
        break;
      }
      console.log("Waiting a mined block to include your transaction... currently in block " + web3.eth.blockNumber);
      await sleep(4000);
  }
}

/**
 * User pressed the "Vote" buttons
 * we must give him options 
 * if already voted - tell him that it is not fair
*/
async function userVote(userId, opts) {
  //check user data first
  bot.editMessageText("Вашему запросу присвоен ID: " + transactionId, opts);

  bot.sendMessage(opts.chat_id, "[" + transactionId + "]: " + "Проверяем кошелек, ожидайте...");

  getUserKeys(userId, opts, function(userKeys) {
    //first check if already voted...
    var voteData = getVotingData(userKeys);
    if (voteData.voted) {
      var candidateInfo = getCandidateInfo(voteData.votedFor);
      var text = "Вы уже проголосовали за кандидата: " + (voteData.votedFor+1) + " - " + candidateInfo.name + "\r\n";
      bot.sendMessage(opts.chat_id, "[" + transactionId + "]: " + text);
    } else {
        bot.sendMessage(opts.chat_id, "[" + transactionId + "]: " + "Получаем список кандидатов, ожидайте...");
        showCandidateList(opts);
    }
  });
}

async function showCandidateList(opts) {
  await sleep(100);

  //if not voted - give candidates as buttons        
  var text = 'Сделай правильный выбор!\r\n';
  text += '------------------------------\r\n';
  var buttons = [];

  //fill candidate buttons
  let candidatesData = getAllCandidatesInfo();
  for (var candidate in candidatesData) {
    var candidateData = candidatesData[candidate];
    buttons.push({
      text: candidateData.info.name, 
      callback_data: 'vote_' + (candidateData.num-1)
    });
  }

  var keyboardStr = JSON.stringify({
      inline_keyboard: [
        buttons
      ]
  });

  //send options to the user
  var keyboard = {reply_markup: JSON.parse(keyboardStr)};
  bot.sendMessage(opts.chat_id, text, keyboard);  
}

/**
 * Show current votes accross all candidates
*/
function voteResults(opts) {
  bot.editMessageText("Получаем список, вашему запросу присвоен ID: " + transactionId, opts);

  showCandidatesListResponse(opts);
}

async function showCandidatesListResponse(opts) {
  await sleep(100);

  let candidatesData = getAllCandidatesInfo();

  let text = "[" + transactionId + "]\r\n" + 'Текущий список кандидатов и голоса\r\n';
  text += '------------------------------\r\n';
  for (var candidate in candidatesData) {
    var candidateData = candidatesData[candidate];
    text += candidateData.num + ' - ' + candidateData.info.name + ' (' + candidateData.info.votes + ')' + '\r\n';
  }
  
  bot.sendMessage(opts.chat_id, text); 
}

/**
 * Get user address and private key by userId
 * if not exists - keys will be created
 * it is not secure to store user keys on server but for development and demo purposes it is fine
*/
async function getUserKeys(userId, opts, callBack) {
  var jsonfile = require('jsonfile')
  var file = './users.json'

  jsonfile.readFile(file, function(err, obj) {
    if (err) {
      bot.editMessageText("[" + transactionId + "]" + "Ошибка чтения файла с пользователями :(", opts);
      return;
    } else {
      var userInfo = obj[userId];
      if (!userInfo) {
          //create account
          bot.sendMessage(opts.chat_id, "[" + transactionId + "]: " + "Создаем кошелек для пользователя...");
          generateUserWallet(userId, opts, obj, callBack);
      } else {
        console.log('Keys for user ' + userId);
        console.log(userInfo);
        callBack(userInfo);        
      }
    }
  })
}

async function generateUserWallet(userId, opts, obj, callBack) {
  var keythereum = require("keythereum");
  var params = { keyBytes: 32, ivBytes: 16 };
  var dk = keythereum.create(params);
  var options = {
    kdf: "pbkdf2",
    cipher: "aes-128-ctr",
    kdfparams: {
      c: 262144,
      dklen: 32,
      prf: "hmac-sha256"
    }
  };

  var keyObject = keythereum.dump('', dk.privateKey, dk.salt, dk.iv, options);
  var userInfo = {
      address: keyObject.address,
      key: dk.privateKey.toString('hex')
  };  

  bot.sendMessage(opts.chat_id,  "[" + transactionId + "]: " + "Отправляем ETH на адрес " + userInfo.address + ", ожидайте ...");

  //send money to user account
  sendMoney(userInfo.address, async function(transactionHash) {
    bot.sendMessage(opts.chat_id,  "[" + transactionId + "]: " + "Деньги успешно отправлены на адрес " + userInfo.address 
      + ", адрес транзакции - https://rinkeby.etherscan.io/tx/" + transactionHash);

    //save user data
    obj[userId] = userInfo;
    var jsonfile = require('jsonfile');
    var file = './users.json';
    jsonfile.writeFile(file, obj, async function (err) {
      if(err) {
        console.error(err);
        bot.sendMessage(opts.chat_id,  "[" + transactionId + "]: " + "Ошибка записи данных кошелька пользователя " + err);        
      } else {
        console.log('Keys for user ' + userId);
        console.log(userInfo);

        bot.sendMessage(opts.chat_id,  "[" + transactionId + "]: " + "Кошелек успешно создан, средства на голосование начислены");

        //call external query to process the request further
        callBack(userInfo);
      }
    })
  });
}
