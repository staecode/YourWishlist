// define model for user for mongoose

const mongoose = require('mongoose');
const List = require('./list')

//create layout of object
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //internal mongoose type
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    // profile_image: <to do>
    createDate: {type: Date, default: Date.now },
    lists: [{type: mongoose.Schema.Types.ObjectId, ref: 'List'}]
});

// think of model like a provided constructor to build these objects (based on schema layout)
// parms: internal name to refer to model, schema name to create new objects of model
module.exports = mongoose.model('User', userSchema);