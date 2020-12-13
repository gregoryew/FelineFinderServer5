const AWS = require('aws-sdk');
let apn = require('@parse/node-apn');
let appRoot = require('app-root-path');
const s3 = require('./s3');
const fs = require('fs');

sendPushTest = function(deviceToken) {
  fs.exists(appRoot + process.env.apnKey, (exists) => {
    if (!exists) {s3.downloadFile('ff-saved-queries', 'AuthKey_6P7YN9TBQF.p8', function(error, data) {
      console.log("ERROR BEGIN")
      console.log(error)
      console.log("ERROR END")      
      fs.writeFileSync(appRoot + 'AuthKey_6P7YN9TBQF.p8', String.fromCharCode.apply(this, data.Body))
      console.log("CERT FILE BEGINS")
      console.log(appRoot + process.env.apnKey)
      console.log("CONTENTS BEGIN")
      console.log(data)
      console.log("CONTENTS END")
      console.log("CERT FILE ENDS")
      sendPush(deviceToken)
    })}
  })
}

sendPush = function(deviceToken) {
var options = {
  token: {
  key: appRoot + 'AuthKey_6P7YN9TBQF.p8',
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