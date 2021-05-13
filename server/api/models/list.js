// define model for user for mongoose

const mongoose = require('mongoose');

//create layout of object
const listSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //internal mongoose type
    name: { type: String, required: true },
    createDate: { type: Date, default: Date.now },
    item_count: { type: Number},
    current_total_cost: { type: Number}
});

// think of model like a provided constructor to build these objects (based on schema layout)
// parms: internal name to refer to model, schema name to create new objects of model
module.exports = mongoose.model('List', listSchema);