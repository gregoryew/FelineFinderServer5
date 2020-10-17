var configValues = require('./config');

module.exports = {
    
    getDbConnectionString: function() {
        //return `mongodb+srv://${configValues.uname}:${configValues.pwd}@felinefinder.f0gql.mongodb.net/ToDos?retryWrites=true&w=majority`;
        return `mongodb://admin:GEW2020gew$16@felinefinder.f0gql.mongodb.net/ToDos`
    }
    
}