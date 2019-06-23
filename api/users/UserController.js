let express = require('express');
let router = express();
let bodyParser = require('body-parser');
let VerifyToken = require(__root + 'middleware/auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));

let User = require('./User');
let Chat = require('../chat/Chat').Model;

router.get('/contacts', VerifyToken, function (req, res) {
    let contacts_id = global["currentUser"].contacts.map(function (element) {
        return element.user_id;
    });
    User.Model.find({_id:{$in: contacts_id }},
        User.MainProjection,
        function (err, users) {
            if(err) {
                console.log(err);
                return res.sendStatus(500);
            }
            //console.log(users);
            res.send(users);
        }
    );
});

router.post('/contacts', VerifyToken, function (req, res) {
    if(!req.body.user_id) return res.sendStatus(400);
    //find current user
    User.Model.findById(
        global["currentUser"].id,
        {},
        function (err, currUser) {
            //if contact already exist send http conflict
            currUser.contacts.forEach(function (element) {
                if(element.user_id === req.body.user_id) res.sendStatus(409);
            });
            //else add new contact to array of contacts
            currUser.contacts.push({user_id: req.body.user_id});
            //save contact
            currUser.save(function (err, success) {
                if(err) {console.log(err); return res.sendStatus(500);}
                //we need to create new private chat, so we try to find exist chat
                Chat.findOne(
                    {
                        $and: [
                            {"users_id.user_id": currUser._id.toString()},
                            {"users_id.user_id": req.body.user_id},
                            {is_private: true},
                        ]
                    },
                    {_id:1, photo_url: 1, messages: {$slice: -1}, users_id: 1, is_private: 1},
                    function (err, privateChat) {
                        if(err) {console.log(err); return res.sendStatus(500);}
                        //if chat exist we send it
                        if(privateChat)
                            return res.send(privateChat);
                        //else we create new private then and then send it
                        else{
                            let newPrivateChat = new Chat({users_id:[{user_id: currUser._id},{user_id: req.body.user_id}],is_private: true});
                            newPrivateChat.save(function (err, newChat) {
                                if(err) {console.log(err); return res.sendStatus(500);}
                                return res.send(newChat);
                            })
                        }
                    }
                );
            })
        }
        )
});

router.delete('/contacts', VerifyToken, function (req, res) {
    User.Model.findOneAndUpdate(
        { _id: global['currentUser']._id },
        { $pull: { contacts: req.body.user_id} },
        function (err, users) {
            if(err) {
                console.log(err);
                return res.sendStatus(500);
            }
            res.sendStatus(200);
        }
    );
});

router.get('/users/search/:search_str', VerifyToken, function (req, res) {
    User.Model.find({
            "$or": [
                {"name" : new RegExp(req.params.search_str, 'i')},
                {"email" : new RegExp(req.params.search_str, 'i')}
            ]
        },
        User.MainProjection,
        function (err, users) {
            if(err){
                console.log(err);
                return res.sendStatus(500);
            }
            if(users.length === 0) return res.sendStatus(404);
            res.send(users);
        }
    );
});



module.exports = router;