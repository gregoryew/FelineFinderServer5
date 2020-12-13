const AWS = require('aws-sdk');
let apn = require('@parse/node-apn');
let appRoot = require('app-root-path');
const s3 = require('./s3');
const fs = require('fs');

sendPushTest = function(deviceToken) {
  if (!fs.exists(appRoot + '/controllers' + process.env.apnKey)) {
    s3.downloadFile('ff-saved-queries', process.env.apnKey, function(error, data) {
      fs.writeFileSync(appRoot + '/controllers' + process.env.apnKey, data)
      sendPush(deviceToken)
    })
  }
}

sendPush = function(deviceToken) {
var options = {
  token: {
  key: appRoot + '/controllers' + process.env.apnKey,
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