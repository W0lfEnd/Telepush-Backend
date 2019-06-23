var express = require('express');
var router = express();
var bodyParser = require('body-parser');

var VerifyToken = require(__root + 'middleware/auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));
var User = require('../users/User');
var Chat = require('./Chat');
var firebaseAdmin = require('firebase-admin');

//get all chats for current user
router.get('/', VerifyToken, function (req, res) {

    Chat.Model.find(
        { "users_id.user_id": global["currentUser"]._id },
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
    Chat.Model.findById(
        req.params.id,
        {
            messages: {$slice: [skip, count] }
        },
        function (err, chat) {
        if(err) {console.log(err);return res.sendStatus(500);}
        if(!chat) return res.sendStatus(404);
        res.send(chat.messages);
    });
});


//get users from chat
router.get('/:id/users', VerifyToken, function (req, res) {
    // Chat.Model.findById(
    //     req.params.id,
    //     {
    //         _id:1,
    //         users_id: 1
    //     },
    //     function (err, chat) {
    //         if(err) {
    //             console.log(err);
    //             return res.sendStatus(500);
    //         }
    //         if(!chat) return res.sendStatus(404);
    //         res.send(chat.users_id);
    //     });
    Chat.Model.aggregate([
        {
            $lookup: {
                "from": "users",
                "localField": "users_id",
                "foreignField": "_id",
                "as": "users"
            }
        },
    ], function (err, result) {
        if(err) {console.log(err);return res.sendStatus(500);}
        res.send(result);
    })
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
    Chat.Model.findById(req.params.id,{},function (err, chatForSending) {
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        let users_id = chatForSending.users_id.map(function (element) {
            return element.user_id;
        });
        if(!users_id.includes(global["currentUser"]._id)) return res.sendStatus(403);
        let newMessage = {
            sender_id: global["currentUser"]._id,
            message_text: req.body.message
        };
        chatForSending.messages.push(newMessage);
        chatForSending.save(function (err, success) {
            if(err) {console.log(err);return res.sendStatus(500);}
            User.Model.find({_id: {$in: chatForSending.users_id}},{}, function (err, users) {
                let sendingTokens = [];
                users.forEach(function (element) {
                    if(element.users_id)
                        sendingTokens = sendingTokens.concat(element.users_id);
                });
                if(sendingTokens.length > 0){
                    firebaseAdmin.messaging().sendToDevice(
                        sendingTokens,
                        {
                            data: {
                                sender_id: global["currentUser"]._id,
                                sender_name: global["currentUser"].name,
                                sender_email: global["currentUser"].email,
                                message: req.body.message
                            }
                        },
                        {
                            timeToLive: 60 * 60 * 24,
                            priority: "high"
                        }
                    );
                }

            });
            res.sendStatus(200);
        });
    })
});


module.exports = router;