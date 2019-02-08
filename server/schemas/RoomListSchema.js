const crypto = require('crypto');
const mongoose = require('mongoose');
const config = require('../config/default.json');
const RoomListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    capacity: {
        type: String,
        required: true
    },
    email : {
        type: String
    },
    location : {
        type : String
    }
});

mongoose.model('RoomList', RoomListSchema, 'roomlist');