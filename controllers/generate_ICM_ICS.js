let schedule = require('./schedule');
module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api/schedule', function(req, res) {
        res.send(schedule);
    }
}