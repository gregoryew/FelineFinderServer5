const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let searchesSchema = new Schema({
    name: String,
    created: Date,
    lastRun: Date,
    times: Number,
    success: Boolean,
    sentPush: Date,
    query: Object
});

let Searches = mongoose.model('Searches', searchesSchema);

module.exports = Searches;