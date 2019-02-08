const express = require('express');
const _ = require('lodash');
const moment = require('moment-timezone');
const router = express.Router();
const db = require('./db.js');
const mongoose = require('mongoose');
const config = require('../config/default.json');
const passport = require('passport');


// User Schema
const Calendar = mongoose.model('Calendar');
const RoomList = mongoose.model('RoomList');

// Error handling
const sendError = (err, res) => {
    let response = {};
    response.success = false;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

// Authorization API
router.get('/roomlist', (req, res) => {
    mongoose.connection.db.collection('roomlist', (e, collection) => {
        if(e) return sendError(err, res);
        collection.find()
            .toArray()
            .then(list => {
                res.status(200).json({success : true, list : list, user: req.user});
            })
            .catch((e) => {
                sendError(e, res);
            })
    })
})

// Authorization API
router.get('/calendarlist', (req, res) => {
    let roomId = req.query.roomId;
    Calendar.find({roomId}, function(err, list) {
        if(err) return sendError(err, res);
        res.status(200).json({success : true, calendarList : list})
    })
})

// Authorization API
router.post('/updatemeeting', (req, res) => {
    let name = req.user.displayName;
    let userId = req.user.oid;
    let body = req.body;
    let startTime = pad2(moment(body.startTime).hour()) + pad2(moment(body.startTime).minute());
    let endTime = pad2(moment(body.endTime).hour()) + pad2(moment(body.endTime).minute());;
    let eventDate = moment(body.startTime).hour(0).minute(0).seconds(0).millisecond(0);
    let endDate = moment(body.endTime).hour(0).minute(0).seconds(0).millisecond(0);
    if(!(eventDate.month() == endDate.month() && eventDate.date() == endDate.date() && eventDate.year() == endDate.year())) {
        return sendError('Invalid slot range, event should be of same date', res);
    }

    Calendar.find({date : new Date(eventDate), roomId : req.body.roomId}, function(err, list) {
        if(err)  return sendError(err);
        let meetings = list[0] && list[0]['meetings'] || {};
        let slots = Object.keys(meetings);
        let startTimeCheck = StartCheck(startTime, slots);
        let endTimeCheck = EndCheck(endTime, slots);
        let betweenCheck = BetweenCheck(startTime, endTime, slots, eventDate);
        if(!startTimeCheck || !endTimeCheck || !betweenCheck) {
            return res.status(400).json({success : false, message : 'Slot already occupied, try with free slot'});
        }
        meetings[startTime+'-'+endTime] = {
            name : name,
            title : body.title,
            description : body.description,
            userId : userId
        }
        mongoose.connection.db.collection('calendar', (e, collection) => {
            if(e) return sendError(e, res);
            if(slots.length) {
                collection.update({date : new Date(eventDate), roomId : req.body.roomId}, {$set : {meetings : meetings} }, function (err, updateRes) {
                    if(err) return sendError(err, res);
                    console.log('update query', updateRes);
                    res.status(200).json({success : true});
                })
            } else {
                collection.insertOne({date : new Date(eventDate), roomId : req.body.roomId, meetings : meetings}, function(err, insertRes) {
                    if(err) return sendError(err, res);
                    console.log('insert query', insertRes);
                    res.status(200).json({success : true});
                })
            }
        })
    })
    console.log(body);
})

module.exports = router;


function pad2 (a) {
    a = a.toString();
    return a.length < 2 ? '0'+a : a;
}

function StartCheck(startTime, slots) {
    for(let i=0; i<slots.length; i++) {
        let cst = slots[i].split('-')[0];
        if(startTime == cst) {
            return false;
        }
    }
    return true;
}

function EndCheck(endTime, slots) {
    for(let i=0; i<slots.length; i++) {
        let cst = slots[i].split('-')[1];
        if(endTime == cst) {
            return false;
        }
    }
    return true;
}

function BetweenCheck(startTime, endTime, slots, date) {
    let st = moment(date).hour(startTime.substr(0,2)).minute(startTime.substr(2));
    let et = moment(date).hour(endTime.substr(0,2)).minute(endTime.substr(2));
    for(let i=0; i<slots.length; i++) {
        let slot = slots[i].split('-');
        let csslot = slot[0], esslot = slot[1];
        let cst = moment(date).hour(csslot.substr(0,2)).minute(csslot.substr(2));
        let est = moment(date).hour(esslot.substr(0,2)).minute(esslot.substr(2));
        if(st.isBetween(cst, est) || et.isBetween(cst, est)) {
            return false;
        }
    }
    return true;
}