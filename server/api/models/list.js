// define model for user for mongoose

const mongoose = require('mongoose');
const Item = require('./item');

//create layout of object
const listSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //internal mongoose type
    name: { type: String, required: true },
    description: { type: String, required: true },
    createDate: { type: Date, default: Date.now },
    item_count: { type: Number, default: 0},
    current_total_cost: { type: Number, default: 0},
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}]
});

// think of model like a provided constructor to build these objects (based on schema layout)
// parms: internal name to refer to model, schema name to create new objects of model
module.exports = mongoose.model('List', listSchema);