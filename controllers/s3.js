const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  apiVersion: "2010-12-01",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-2"
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
    s3.upload(params, function(s3Err, data) {
        if (s3Err) throw s3Err
        return `File uploaded successfully at ${data.Location}`;
    });
};

const downloadFile = (bucketName, fileName, callback) => {
    const params = {
        Bucket: bucketName, // pass your bucket name
        Key:  fileName, // file will be saved as testBucket/contacts.csv
    };
    s3.getObject(params, function(err, data) {
        callback(err, data)           // successful response
    });
};

module.exports.uploadFile = uploadFile
module.exports.downloadFile = downloadFile