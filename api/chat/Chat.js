let mongoose = require('mongoose');
let ChatSchema = new mongoose.Schema({
    photo_url: String,
    users_id: [String],
    messages: [{
        sender_id: { type: String, index: true },
        message_text: String,
        sending_date: { type: Date, index: true }
    }]
});

mongoose.model('Chat', ChatSchema);
let Model = mongoose.model('Chat');
module.exports = Model;