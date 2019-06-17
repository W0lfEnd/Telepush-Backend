
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require(__root + 'config/config'); // get our config file
var User = require(__root + 'api/users/User').Collection;
global["currentUser"] = null;
function verifyToken(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.headers['x-access-token'];
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });

    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        // if everything is good, save to request for use in other routes
        req.userId = decoded.id;
        User.findById(decoded.id,{ password: 0 },function (err,user) {
            if(err)
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            global["currentUser"] = user;
            console.log("Authorized user: " + user.email);
            next();
        });

    });

}

module.exports = verifyToken;