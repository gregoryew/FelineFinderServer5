var express = require('express');
var app = express();
var mongoose = require('mongoose');
var setupController = require('./controllers/setupController');
var apiController = require('./controllers/apiController');
var imageProber = require('./controllers/image-prober');

var port = process.env.PORT || 3000;

app.use('/assets', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

const uri = process.env.MONGODBURI

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

//mongoose.connect(config.getDbConnectionString());
setupController(app);
apiController(app);
imageProber(app);

app.listen(port);