const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let userIdTokenMappingsSchema = new Schema({
    userId: String,
    token: String
});

let userIdTokenMappings = mongoose.model('userIdTokenMappings', userIdTokenMappingsSchema);

module.exports = userIdTokenMappings;