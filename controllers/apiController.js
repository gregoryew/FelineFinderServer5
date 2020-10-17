const Searches = require('../models/search');
const bodyParser = require('body-parser');
const rq = require('aif-request');
const fs = require('fs');
const appRoot = require('app-root-path');
const axios = require('axios');

module.exports = function(app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.get('/api/search/process', function(req, res) {
        Searches.find({ $or : [  {  sentPush : null }, {sentPush: {$gt:new Date(Date.now() - 24*60*60 * 1000)}} ] }, function(err, searches) {
            if (err) throw err;
            
            for (search of searches) {
            fs.readFile(appRoot + '/queries/' + search.id + '.json', function (err, data) {
                let query = JSON.parse(data);
                axios.post('https://api.rescuegroups.org/http/v2.json', query)
                  .then(function (response) {
                    if(response && response.data && response.data.foundRows) {res.send({foundRows: response.data.foundRows})};
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
                /*
                rq.postJson('https://api.rescuegroups.org/http/v2.json', query, function(rs, err) {
                    if (err) throw err
                    if (rs && rs.rowsFound > 0) {
                        console.log(rs);
                        //send sns
                        //update search
                    }
                    res.send(search);
                })
                */
            });
        }
        }); 
    });
    
    app.get('/api/search/:id', function(req, res) {
       
       Searches.findById({ _id: req.params.id }, function(err, search) {
           if (err) throw err;
           
           res.send(search);
       });
        
    });
    
    app.post('/api/search', function(req, res) {
        const query = req.body.query;
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
                fs.writeFileSync(appRoot + `\queries\${search.id}.json`, JSON.stringify(query))
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
               fs.writeFile(appRoot + `\queries\${search.id}.json`, JSON.stringify(query))
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