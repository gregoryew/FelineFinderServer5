const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadFile = (bucketName, fileName, body) => {
    const params = {
        Bucket: bucketName, // pass your bucket name
        Key:  fileName, // file will be saved as testBucket/contacts.csv
        Body: body
    };
    console.log('********** Params = ' + params);
    console.log('********** S3 = ' + s3);
    s3.upload(params, function(s3Err, data) {
        if (s3Err) throw s3Err
        return `File uploaded successfully at ${data.Location}`;
    });
};

module.exports.uploadFile = uploadFile