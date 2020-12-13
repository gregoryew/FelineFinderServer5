let apn = require('@parse/node-apn');
let appRoot = require('app-root-path');
const s3 = require('./s3.js');
const fs = require('fs');

sendPushTest = function(deviceToken) {

  if (!fs.exists(appRoot() + 'controllers/AuthKey_6P7YN9TBQF.p8')) {
    s3.downloadFile('ff-saved-queries', 'AuthKey_6P7YN9TBQF.p8')
    .then(function(data) {
      console.log('Writting cert to ' + appRoot() + 'controllers/AuthKey_6P7YN9TBQF.p8');
      fs.writeFileSync(appRoot() + 'controllers/AuthKey_6P7YN9TBQF.p8')
    })
    .catch (function (error) {
      console.log("ERROR = " + error)
    })
  }    

var options = {
    token: {
    key: appRoot() + 'controllers/' + process.env.apnKey,
    keyId: process.env.apnKeyId,
    teamId: process.env.apnTeamID
    },
    production: false
};

var apnProvider = new apn.Provider(options);    

var note = new apn.Notification();

note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 3;
note.sound = "ping.aiff";
note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
note.payload = {'messageFrom': 'John Appleseed'};
note.topic = "com.gregsiosapps.TestAPN"

apnProvider.send(note, deviceToken).then( (result) => {
    console.log("RESULT = " + JSON.stringify(result));
    // see documentation for an explanation of result
  });
}

module.exports.sendPushTest = sendPushTest