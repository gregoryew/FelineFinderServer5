const AWS = require('aws-sdk');
const fs = require('fs'); // Needed for example below

const spacesEndpoint = new AWS.Endpoint('sfo2.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_SECRET_ACCESS_KEY
});

const uploadFile = (bucketName, fileName, query) => {
    const params = {
        Bucket: bucketName, // pass your bucket name
        Key:  fileName, // file will be saved as testBucket/contacts.csv
        Body: JSON.stringify(query)
    };
    console.log('!!!!!! query = ' + JSON.stringify(query));
    console.log('********** Params = ' + JSON.stringify(params));
    console.log('********** S3 = ' + JSON.stringify(s3));
    s3.putObject(params, function(err, data) {
        if (err) throw err
        return "File uploaded successfully at ${data.Location}";
    });
};

/*
const downloadFile = (bucketName, fileName, callback) => {
    const params = {
        Bucket: bucketName, // pass your bucket name
        Key:  fileName, // file will be saved as testBucket/contacts.csv
    };
    s3.getObject(params, function(err, data) {
        callback(err, data)           // successful response
    });
};
*/

function streamPromise(stream) {
    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            resolve('end');
        });
        stream.on('finish', () => {
            resolve('finish');
        });
        stream.on('error', (error) => {
            reject(error);
        });
    });
}

async function s3Download(srcBucket, srcKey, outputPath) {
    var objReq = s3.getObject({
        Bucket: srcBucket,
        Key: srcKey
    });
    let outStream = fs.createWriteStream(outputPath);
    let readStream = objReq.createReadStream();
    readStream.on('error', (err) => {
        console.warn('s3download error', err);
        outStream.emit("error", err);
    });
    readStream.pipe(outStream);
    return streamPromise(outStream);
}

module.exports.uploadFile = uploadFile
module.exports.downloadFile = downloadFile