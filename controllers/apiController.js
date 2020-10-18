const Searches = require('../models/search');
const bodyParser = require('body-parser');
const rq = require('aif-request');
const fs = require('fs');
const appRoot = require('app-root-path');
const axios = require('axios');
const s3 = require('./s3.js');

module.exports = function(app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.get('/api/search/process', function(req, res) {
        Searches.find({ $or : [  {  sentPush : null }, {sentPush: {$gt:new Date(Date.now() - 24*60*60 * 1000)}} ] }, function(err, searches) {
            if (err) throw err;
            
            for (search of searches) {
                s3.downloadFile('ff-saved-queries', search.id + '.json', function(err, data) {
                //fs.readFile('https://ff-saved-queries.s3.us-east-2.amazonaws.com/' + search.id + '.json', function (err, data) {
                if (err) {console.log('PROCESS SEARCH ERROR = ' + err);}
                console.log("DATA = " + JSON.stringify(data));
                query = data.Body.toString('utf-8');
                console.log('=================================');
                console.log('Sending query to rescue groups');
                console.log('QUERY = ' & query);
                query = JSON.parse(query);
                axios.post('https://api.rescuegroups.org/http/v2.json', query)
                  .then(function (response) {
                    //console.log('SUCCESS RESPONSE = ' + response);
                    if(response && response.data && response.data.foundRows) {res.send({foundRows: response.data.foundRows})};
                  })
                  .catch(function (error) {
                    console.log('ERROR = ' + error);
                  });
            });
        }
       }); 
    });
    
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