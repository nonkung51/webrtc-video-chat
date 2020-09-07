const mongoose = require('mongoose');
const { Schema } = mongoose;

const callSchema = new Schema({
    caller1: String,
    caller2: String,
    elapseTime: Number
});

mongoose.model('call', callSchema);