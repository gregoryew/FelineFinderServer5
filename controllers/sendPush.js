const AWS = require('aws-sdk');
let apn = require('@parse/node-apn');
let appRoot = require('app-root-path');
const s3 = require('./s3');
const fs = require('fs');

sendPushTest = function(deviceToken, badge, sound, alert, payload, topic) {
  fs.exists(appRoot + '/controllers/AuthKey_93W3KKU5K6.p8', (exists) => {
    if (!exists) {s3.downloadFile('ff-saved-queries', 'AuthKey_93W3KKU5K6.p8', function(error, data) {
      console.log("ERROR BEGIN")
      console.log(error)
      console.log("ERROR END")
      console.log("FILE = " + appRoot + "/controllers/AuthKey_93W3KKU5K6.p8");      
      fs.writeFileSync(appRoot + '/controllers/AuthKey_93W3KKU5K6.p8', String.fromCharCode.apply(this, data.Body))
      console.log("CERT FILE BEGINS")
      console.log(appRoot + process.env.apnKey)
      console.log("CONTENTS BEGIN")
      console.log(data)
      console.log("CONTENTS END")
      console.log("CERT FILE ENDS")
      sendPush(deviceToken, badge, sound, alert, payload, topic)
    })} else {
      sendPush(deviceToken, badge, sound, alert, payload, topic)
    }})
}

sendPush = function(deviceToken, badge, sound, alert, payload, topic) {
var options = {
  token: {
  key: appRoot + '/controllers/AuthKey_93W3KKU5K6.p8',
  keyId: process.env.apnKeyId,
  teamId: process.env.apnTeamID
  },
  production: false
};

console.log("@@@@@@@ OPTIONS BEGIN")
console.log(JSON.stringify(options))
console.log("@@@@@@@ OPTIONS END")

var apnProvider = new apn.Provider(options);    

var note = new apn.Notification();

note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = badge;
note.sound = sound;
note.alert = alert;
note.payload = payload;
note.topic = topic

/*
note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 3;
note.sound = "ping.aiff";
note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
note.payload = {'messageFrom': 'John Appleseed'};
note.topic = "com.gregorysiosgames.catapp"
*/

apnProvider.send(note, deviceToken).then( (result) => {
  console.log("RESULT = " + JSON.stringify(result));
  // see documentation for an explanation of result
})
.catch ((error) => {console.log("ERROR = " & error)})
}

module.exports.sendPushTest = sendPushTest