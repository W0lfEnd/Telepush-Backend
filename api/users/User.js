let mongoose = require('mongoose');
let UserSchema = new mongoose.Schema({
    photo: {data: Buffer, contentType: String, default: ''},
    name: {type: String, required: true},
    email: {type: String, index: true, required: true, unique: true},
    password: {type: String, required: true},
    contacts: {type: [{user_id: String}], default: []},
    firebaseInstanceIds: [{instanceId: String, date: Date}],
    dateCreated: {type: Date, default: Date.now},
    sex: {type: Boolean, default: null}
});
let MainProjection = {
    _id: 1,
    photo : 1,
    name: 1,
    email: 1,
    sex: 1
};
mongoose.model('User', UserSchema);
let Model = mongoose.model('User');
module.exports = {
    Model: Model,
    MainProjection: MainProjection
};
//module.exports = Model;
//module.exports.MainProjection = MainProjection;