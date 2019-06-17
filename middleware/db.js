var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://127.0.0.1:27017/telepush', { useNewUrlParser: true });