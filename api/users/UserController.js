let express = require('express');
let router = express();
let bodyParser = require('body-parser');
let VerifyToken = require(__root + 'middleware/auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));

let User = require('./User');

router.get('/contacts', VerifyToken, function (req, res) {
    User.Collection.find({_id:{$in: global["currentUser"].contacts }},
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
    if(!req.body.contact_id) return res.sendStatus(400);
    User.Collection.findById(req.body.contact_id,User.MainProjection, function (err, docs) {
        if(err) {
            //console.log(err);
            return res.sendStatus(404);
        }
        if(!docs) return res.sendStatus(404);
        User.Collection.findOneAndUpdate(
            {_id: global['currentUser']._id},
            {$addToSet: { contacts: req.body.contact_id}},
            function (err, users) {
                if(err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                console.log(users);
                res.sendStatus(200);
            }
        );
    });

});

router.delete('/contacts', VerifyToken, function (req, res) {
    User.Collection.findOneAndUpdate(
        { _id: global['currentUser']._id },
        { $pull: { contacts: req.body.contact_id} },
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
    User.Collection.find({
            "$or": [
                {"name" : new RegExp(req.params.search_str, 'i')},
                {"email" : new RegExp(req.params.search_str, 'i')}
            ]
        },User.MainProjection,
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