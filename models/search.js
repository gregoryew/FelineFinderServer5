const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let searchesSchema = new Schema({
    userId: { type: String },
    name: String,
    created: Date,
    lastRun: Date,
    times: Number,
    success: Boolean,
    sentPush: Date,
    query: String
});

let Searches = mongoose.model('Searches', searchesSchema);

module.exports = Searches;