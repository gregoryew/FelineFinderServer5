const schedule = require('schedule');
module.exports = function(app) {
    app.get('/api/schedule', function(req, res) {
        console.writeln(JSON.stringify(schedule));
        json.send(schedule);
    })
}