const Searches = require('../models/search');
const userIdTokenMappings = require('../models/userTokenMapping');
const bodyParser = require('body-parser');
const rq = require('aif-request');
const fs = require('fs');
const appRoot = require('app-root-path');
const axios = require('axios');
const s3 = require('./s3.js');
const sendPush = require('./sendPush.js');
const schedule = require('./schedule.js');
const { google, ics } = require("calendar-link");

module.exports = function(app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.get('/api/schedule', function(req, res) {
        for (s of schedule) {
            const event = {
                title: s.Name,
                description: '<a href="' + s.bitly + '"> Join Meeting </a>',
                start: s.EventDate,
                duration: [Math.abs(new Date(s.Close) - new Date(s.EventDate)) / 36e5, "hour"],
            };
            s.ICM = google(event);
            s.ICS = ics(event);
        }
        res.send(schedule);
    })
    
    app.get('/api/pushTest', function(req, res) {
        sendPush.sendPushTest()
        res.send('Push Sent');
    })

    app.get('/api/search/process', function(req, res) {
        Searches.aggregate([
        { $match: { $or : [  {  sentPush : null }, { success : false  }, {sentPush: {$lt:new Date(Date.now() - 24*60*60 * 1000)}} ] }},
        {
            $lookup: {
                from: "useridtokenmappings", // collection name in db
                localField: "userId",
                foreignField: "userId",
                as: "searchesWithIDs"
            }
        }]).exec(function(err, searches) {
            if (err) {
                console.log("JOIN ERROR = " + err)
            } else {
                processSearches(searches)
                res.send("Done"); 
            }
        });
    });

    function processSearches(searches) {
        //searches.find({ $or : [  {  sentPush : null }, {sentPush: {$gt:new Date(Date.now() - 24*60*60 * 1000)}} ] }, function(err, searches) {
        //    if (err) throw err;
        console.log("SEARCHES BEGIN")
        console.log(JSON.stringify(searches))
        console.log("SEARCHES END")
        for (let i in searches) {
            console.log("SEARCH = " + searches[i]);
            s3.downloadFile('ff-saved-queries', searches[i]._id + '.json', function(err, data) {
            //fs.readFile('https://ff-saved-queries.s3.us-east-2.amazonaws.com/' + search.id + '.json', function (err, data) {
            console.log("file name = " + searches[i]._id + ".json")
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

            axios.post('https://api.rescuegroups.org/v5/public/animals/search/available?sort=animals.distance&fields[animals]=id&limit=1', 
            query
            )
                .then(function (response) {
                //console.log('SUCCESS RESPONSE = ' + JSON.stringify(response));
                console.log("SEARCH = " + JSON.stringify(searches[i]))
                //console.log("RESPONSE = " + cleanStringify(response))
                // deviceToken, badge, sound, alert, payload, topic)
                console.log("TOKEN = " + searches[i].searchesWithIDs[0].token);
                if(response && response.data && response.data.meta && response.data.meta.count) {
                    if (response.data.meta.count > 0) {
                        sendPush.sendPushTest(
                            searches[i].searchesWithIDs[0].token,
                            0,
                            "ping.aiff",
                            response.data.meta.count + ' matches found for the saved search you named: ' + searches[i].name,
                            {"queryID": searches[i]._id},
                            "com.gregorysiosgames.catapp")
                        }
                        console.log("Sending Message")
                        Searches.findByIdAndUpdate(searches[i]._id, {
                            lastRun: Date.now(),
                            times: searches[i].times + 1,
                            success: true,
                            sentPush: Date.now()
                        }, function(err, search) {
                            if (err) throw err;
                        });           
                        console.log("Updating Message")
                    }
                })
                .catch(function (error) {
                    Searches.findByIdAndUpdate(searches[i]._id, {
                        lastRun: Date.now(),
                        success: false,
                        sentPush: null
                    }, function(err, search) {
                        if (err) throw err;
                    });           
            console.log('ERROR = ' + error);
                });
        });
        }
    }
    
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
           s3.downloadFile('ff-saved-queries', req.params.id + '.json', function(err, data) {
               if (err) throw err;
               console.log("S3 Query Data Begin")
               console.log(String.fromCharCode.apply(this, data.Body))
               console.log("S3 Query Data End")
               res.send(String.fromCharCode.apply(this, data.Body))
           });
       });
    });
    
    app.post('/api/user', function(req, res) {
        console.log("@@@@@@@@@UserID = " + req.body.userId)
        console.log("@@@@@@@@@Token = " + req.body.token)
        userIdTokenMappings.findOneAndUpdate({ userId: req.body.userId }, { token: req.body.token }, options = { upsert: true }, function(error, result) {
            if (!error) {
                // Save the document
                result.save(function(error) {
                    if (!error) {
                        console.log("Success")
                        res.send('Success');
                    } else {
                        console.log("ERROR")
                        throw error;
                    }
                });
            } else {
                console.log("ERROR")
                res.send('Error');
            }
        });
    })

    app.post('/api/search', function(req, res) {
        const query2 = req.body.query;
        console.log('REQ = ' + JSON.stringify(req.body));
        console.log('QUERY2 = ' + JSON.stringify(query2));
        if (req.body.id) {
            Search.findByIdAndUpdate(req.body.id, {
                userId: req.body.userId,
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
            userId: req.body.userId,
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
    
    app.delete("/api/search/:name", (req, res) => {

        console.log("delete path");

        const name = req.params.name || req.query.name;

        console.log("delete name = |" + name + "|");

        Searches.findByIdAndRemove(name, function(err) {
            if (err) {
                console.log('delete failed name = ' + name + ' the err is ' + err.String);
                throw err;
            }
            res.send('Success');
        })

    });

    app.delete('/api/search', function(req, res) {
        
        console.log("app.delete");
        console.log("delete name = |" + req.params + "|");
        console.log("delete name = |" + req.body.name + "|");
        console.log("delete name = |" + req.body.query + "|");

        var qry = {name: `${req.body.name}`}
        console.log(qry);

        searches.remove(
            qry, function(err, obj) {
                if (err) throw err;
                console.log(obj.result.n + "document(s) deleted");
                res.send('Success');
            }
        )
    });
}