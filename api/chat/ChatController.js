var express = require('express');
var router = express();
var bodyParser = require('body-parser');

var VerifyToken = require(__root + 'middleware/auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));
var User = require('../users/User');
var Chat = require('./Chat');

//get all chats for current user
router.get('/', VerifyToken, function (req, res) {
    Chat.Model.find(
        { users_id: global["currentUser"]._id },
        Chat.MainProjection,
        function (err, chats) {
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        if(!chats) return res.sendStatus(404);
        res.send(chats);
    });
});

//get chat main info
router.get('/:id', VerifyToken, function (req, res) {
    Chat.Model.findById(
        req.params.id,
        Chat.MainProjection,
        function (err, chat) {
        if(err) return res.sendStatus(500);
        if(!chat) return res.sendStatus(404);
        res.send(chat);
    });
});

//get messages from chat
router.get('/:id/messages', VerifyToken, function (req, res) {
    if(!req.body.skip || !req.body.count) return res.sendStatus(400);
    let skip = Number(req.body.skip);
    let count = Number(req.body.count);
    console.log({skip,count});
    Chat.Model.findById(
        req.params.id,
        {
            messages: {$slice: [skip, count] }
        },
        function (err, chat) {
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        if(!chat) return res.sendStatus(404);
        res.send(chat.messages);
    });
});


//get users from chat
router.get('/:id/users', VerifyToken, function (req, res) {
    Chat.Model.findById(
        req.params.id,
        {
            _id:1,
            users_id: 1
        },
        function (err, chat) {
            if(err) {
                console.log(err);
                return res.sendStatus(500);
            }
            if(!chat) return res.sendStatus(404);
            res.send(chat.users_id);
        });
});


//TODO get messages which have date sending more then in request
router.get('/:id/messages/:date', VerifyToken, function (req, res) {
    let date = req.params.date;
    Chat.Model.findById(
        req.params.id,
        {
            _id:1,
            "messages.date_sending" : {$gt: new Date(date)}
        },
        function (err, chat) {
            if(err) {
                console.log(err);
                return res.sendStatus(500);
            }
            if(!chat) return res.sendStatus(404);
            res.send(chat.messages);
    });
});

//send message to chat
router.post('/:id/send', VerifyToken, function (req, res) {
    if(!req.body.message) return res.sendStatus(400);
    Chat.Model.findById(req.params.id,{},function (err, doc) {
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        if(!doc.users_id.includes(global["currentUser"]._id)) return res.sendStatus(403);
        Chat.Model.findOneAndUpdate(
            req.params.id,
            {$addToSet: { messages: req.body.message}},
            function (err, chat) {
                if(err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                res.sendStatus(200);
            });
    })
});


module.exports = router;