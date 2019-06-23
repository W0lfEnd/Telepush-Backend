let mongoose = require('mongoose');
let ChatSchema = new mongoose.Schema({
    photo_url: {data: Buffer, contentType: String, default: ''},
    users_id: {type: [{user_id:String}], default: []},
    messages: {
        type: [{
            sender_id: { type: String, index: true },
            message_text: String,
            sending_date: { type: Date, index: true , default: Date.now}
        }], default: []
    },
    is_private: Boolean
});

mongoose.model('Chat', ChatSchema);
let Model = mongoose.model('Chat');
module.exports =  {
    Model: Model,
    MainProjection: {_id:1, photo_url: 1, messages: {$slice: -1}, is_private: 1}
};