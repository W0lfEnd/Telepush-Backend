var express = require('express');
var router = express();
var bodyParser = require('body-parser');

var VerifyToken = require(__root + 'middleware/auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));
var User = require('../users/User');
var Chat = require('./Chat');
// RETURNS ALL THE USERS IN THE DATABASE
router.get('/:id', VerifyToken, function (req, res) {
    Chat.findById(req.params.id,function (err, chat) {
        if(err) return res.send(500);
        if(!chat) return res.send(404);
    });
});

// GETS A SINGLE USER FROM THE DATABASE
router.post('/:id', VerifyToken, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        if (!user) return res.status(404).send("No users found.");
        res.status(200).send(user);
    });
});


module.exports = router;