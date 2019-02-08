const crypto = require('crypto');
const mongoose = require('mongoose');
const CalendarSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    roomId: {
        type: String,
        required: true
    },
    meetings: {
        type: Object
    },
    createdAt : {
        type : Date
    },
    updatedAt : {
        type : Date
    }
});

mongoose.model('Calendar', CalendarSchema, 'calendar');