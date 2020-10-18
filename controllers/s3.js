const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
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

const downloadFile = (bucketName, fileName) => {
    const params = {
        Bucket: bucketName, // pass your bucket name
        Key:  fileName, // file will be saved as testBucket/contacts.csv
    };
    s3.getObject(params, function(err, data) {
        if (err) {console.log(err, err.stack);} // an error occurred
        else return data           // successful response
    });
};

module.exports.uploadFile = uploadFile