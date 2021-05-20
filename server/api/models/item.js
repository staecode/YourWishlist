const mongoose = require('mongoose');

//create layout of object
const itemSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //internal mongoose type
    name: { type: String, required: true },
    sourcelink: { type: String, required: true },
    addDate: { type: Date, default: Date.now },
    price: { type: Number, required: true},
    description: { type: String }
});

// think of model like a provided constructor to build these objects (based on schema layout)
// parms: internal name to refer to model, schema name to create new objects of model
module.exports = mongoose.model('Item', itemSchema);

// test