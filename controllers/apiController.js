const Searches = require('../models/search');
const bodyParser = require('body-parser');
const rq = require('aif-request');
const fs = require('fs');
const appRoot = require('app-root-path');
const axios = require('axios');
const s3 = require('./s3.js');
const sendPush = require('./sendPush.js');
const bufferToString = require('string-encode');

module.exports = function(app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.get('/api/pushTest', function(req, res) {
        sendPush.sendPushTest()
        res.send('Push Sent');
    })

    app.get('/api/search/process', function(req, res) {
        Searches.find({ $or : [  {  sentPush : null }, {sentPush: {$gt:new Date(Date.now() - 24*60*60 * 1000)}} ] }, function(err, searches) {
            if (err) throw err;
            
            for (search of searches) {
                s3.downloadFile('ff-saved-queries', search.id + '.json', function(err, data) {
                //fs.readFile('https://ff-saved-queries.s3.us-east-2.amazonaws.com/' + search.id + '.json', function (err, data) {
                console.log("file name = " + search.id + ".json")
                if (err) {console.log('PROCESS SEARCH ERROR = ' + err);}
                console.log("data = " + JSON.stringify(data));
                //query = bufferToString.buffer2str(data.Body.buffer, false);
                //query = JSON.stringify(data.Body)
                query = String.fromCharCode.apply(this, data.Body);
                console.log('=================================');
                console.log('Sending query to rescue groups');
                console.log('--------------');
                console.log('DATA = ' + data.Body);
                console.log('QUERY = ' + query);
                console.log('--------------');

                axios.defaults.headers.common['Authorization'] = process.env.RESCUEGROUPS_API;
                axios.defaults.headers.post['Content-Type'] = 'application/vnd.api+json';

                axios.post('https://api.rescuegroups.org/v5/public/animals/search/available?sort=animals.distance&fields[animals]=id,name,breedPrimary,ageGroup,sex,updatedDate,birthDate,availableDate,sizeGroup,descriptionHtml,descriptionText,status&limit=25', 
                query
                )
                  .then(function (response) {
                    //console.log('SUCCESS RESPONSE = ' + JSON.stringify(response));
                    console.log("RESPONSE = " + cleanStringify(response))
                    console.log()
                    if(response && response.data && response.data.meta && response.data.meta.count) {res.send({foundRows: response.data.meta.count})};
                  })
                  .catch(function (error) {
                    console.log('ERROR = ' + error);
                  });
            });
        }
       }); 
    });
    
    function cleanStringify(object) {
        if (object && typeof object === 'object') {
            object = copyWithoutCircularReferences([object], object);
        }
        return JSON.stringify(object);
    
        function copyWithoutCircularReferences(references, object) {
            var cleanObject = {};
            Object.keys(object).forEach(function(key) {
                var value = object[key];
                if (value && typeof value === 'object') {
                    if (references.indexOf(value) < 0) {
                        references.push(value);
                        cleanObject[key] = copyWithoutCircularReferences(references, value);
                        references.pop();
                    } else {
                        cleanObject[key] = '###_Circular_###';
                    }
                } else if (typeof value !== 'function') {
                    cleanObject[key] = value;
                }
            });
            return cleanObject;
        }
    };

    app.get('/test', function (req, res) {
        res.send("Can access API");
    })

    app.get('/mongodb-test', function (req, res) {
        Searches.find({}, function(err, search) {
            if (err) throw err;
            
            res.send(search);
        });
    })

    app.get('/api/search/:id', function(req, res) {
       
       Searches.findById({ _id: req.params.id }, function(err, search) {
           if (err) throw err;
           
           res.send(search);
       });
        
    });
    
    app.post('/api/search', function(req, res) {
        const query2 = req.body.query;
        console.log('REQ = ' + JSON.stringify(req.body));
        console.log('QUERY2 = ' + JSON.stringify(query2));
        if (req.body.id) {
            Search.findByIdAndUpdate(req.body.id, {
                name: req.body.name,
                created: req.body.created,
                lastRun: null,
                times: 0,
                success: null,
                sentPush: null,
                query: null             
            }, function(err, search) {
                if (err) throw err;
                s3.uploadFile('ff-saved-queries', `${search.id}.json`, query2);
                //fs.writeFileSync(appRoot + `\queries\${search.id}.json`, JSON.stringify(query))
                res.send('Success');
            });
        }
        
        else {
           
           var newSearch = Searches({
            name: req.body.name,
            created: new Date(),
            lastRun: null,
            times: 0,
            success: null,
            sentPush: null,
            query: null             
           });
           newSearch.save(function(err, search) {
               if (err) throw err;
               s3.uploadFile('ff-saved-queries', `${search.id}.json`, query2);
               //fs.writeFile(appRoot + `\queries\${search.id}.json`, JSON.stringify(query))
               res.send('Success');
           });
            
        }
        
    });
    
    app.delete('/api/search', function(req, res) {
        
        Searches.findByIdAndRemove(req.body.id, function(err) {
            if (err) throw err;
            res.send('Success');
        })
         
    });
}