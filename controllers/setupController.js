var Searches = require('../models/search');
const fs = require('fs');
var appRoot = require('app-root-path');
const path = require('path');

module.exports = function(app) {
    
   app.get('/api/setupSearches', function(req, res) {
       
       const apiKey = process.env.APIKEY

       // seed database
       var starterSearches = [
           {
            name: 'Birman',
            created: new Date(),
            lastRun: null,
            times: 0,
            success: null,
            sentPush: null,
            query: {"apikey": apiKey, "search": {"resultStart": "0", "resultSort": "animalLocationDistance", "resultOrder": "asc", "resultLimit": "25", "calcFoundRows": "Yes", "filters": [{"criteria": ["9"], "fieldName": "animalPrimaryBreedID", "operation": "equals"}, {"criteria": "Adopted", "fieldName": "animalStatus", "operation": "notequals"}, {"criteria": "cat", "fieldName": "animalSpecies", "operation": "equals"}, {"fieldName": "animalLocationDistance", "criteria": "4000", "operation": "radius"}, {"operation": "equals", "criteria": "94608", "fieldName": "animalLocation"}], "fields": ["animalID", "animalName", "animalBreed", "animalGeneralAge", "animalSex", "animalPrimaryBreed", "animalUpdatedDate", "animalOrgID", "animalLocationDistance", "animalLocationCitystate", "animalPictures", "animalStatus", "animalBirthdate", "animalAvailableDate", "animalGeneralSizePotential", "animalVideoUrls"]}, "objectType": "animals", "objectAction": "publicSearch"} 
           },
           {
            name: 'Abyssinian',
            created: new Date(),
            lastRun: null,
            times: 0,
            success: null,
            sentPush: null,
            query: {"apikey": apiKey, "search": {"resultStart": "0", "resultSort": "animalLocationDistance", "resultOrder": "asc", "resultLimit": "25", "calcFoundRows": "Yes", "filters": [{"criteria": ["1"], "fieldName": "animalPrimaryBreedID", "operation": "equals"}, {"criteria": "Adopted", "fieldName": "animalStatus", "operation": "notequals"}, {"criteria": "cat", "fieldName": "animalSpecies", "operation": "equals"}, {"fieldName": "animalLocationDistance", "criteria": "4000", "operation": "radius"}, {"operation": "equals", "criteria": "94608", "fieldName": "animalLocation"}], "fields": ["animalID", "animalName", "animalBreed", "animalGeneralAge", "animalSex", "animalPrimaryBreed", "animalUpdatedDate", "animalOrgID", "animalLocationDistance", "animalLocationCitystate", "animalPictures", "animalStatus", "animalBirthdate", "animalAvailableDate", "animalGeneralSizePotential", "animalVideoUrls"]}, "objectType": "animals", "objectAction": "publicSearch"} 
           },
           {
            name: 'Unknown',
            created: new Date(),
            lastRun: null,
            times: 0,
            success: null,
            sentPush: null,
            query: {"apikey": apiKey, "search": {"resultStart": "0", "resultSort": "animalLocationDistance", "resultOrder": "asc", "resultLimit": "25", "calcFoundRows": "Yes", "filters": [{"criteria": ["22"], "fieldName": "animalPrimaryBreedID", "operation": "equals"}, {"criteria": "Adopted", "fieldName": "animalStatus", "operation": "notequals"}, {"criteria": "cat", "fieldName": "animalSpecies", "operation": "equals"}, {"fieldName": "animalLocationDistance", "criteria": "4000", "operation": "radius"}, {"operation": "equals", "criteria": "94608", "fieldName": "animalLocation"}], "fields": ["animalID", "animalName", "animalBreed", "animalGeneralAge", "animalSex", "animalPrimaryBreed", "animalUpdatedDate", "animalOrgID", "animalLocationDistance", "animalLocationCitystate", "animalPictures", "animalStatus", "animalBirthdate", "animalAvailableDate", "animalGeneralSizePotential", "animalVideoUrls"]}, "objectType": "animals", "objectAction": "publicSearch"}
          }
       ];
       Searches.remove({});
       Searches.create(starterSearches, function(err, results) {
            if (err) throw err;
            const directory = appRoot + '/queries';
            fs.readdir(directory, (err, files) => {
                if (err) throw err;

                for (const file of files) {
                    fs.unlink(path.join(directory, file), err => {
                        if (err) throw err;
                    });
                }
                
                for(var i = 0; i < results.length; i++) {
                    s3.uploadFile('ff-saved-queries', `${results[i].id}.json`, JSON.stringify(results[i].query));
                    //fs.writeFileSync(appRoot + '/queries/' + results[i].id + '.json', JSON.stringify(results[i].query));
                }

                res.send(results);

            });
       });
   });
    
}