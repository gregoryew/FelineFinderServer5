const bodyParser = require('body-parser');
const schedule = require('./schedule.js');
module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.get('/api/schedule', function(req, res) {
        console.writeln(JSON.stringify(schedule));
        res.send(schedule);
    })
}