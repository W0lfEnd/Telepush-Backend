let mongoose = require('mongoose');
let UserSchema = new mongoose.Schema({
    photo: {data: Buffer, contentType: String, default: ''},
    name: {type: String, required: true},
    email: {type: String, index: true, required: true},
    password: {type: String, required: true},
    contacts: [{type: String, unique: true}],
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
let Collection = mongoose.model('User');
module.exports = {
    Collection: Collection,
    MainProjection: MainProjection
};
//module.exports = Collection;
//module.exports.MainProjection = MainProjection;