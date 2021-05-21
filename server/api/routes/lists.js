const express = require('express');
const router = express.Router(); //object
const List = require('../models/list');
const mongoose = require('mongoose');
const Item = require('../models/item');

router.get('/', (req, res, next) => {
    List.find()
    .then(docs => {
        console.log(docs);
        return res.status(201).json({ 
            message: 'Lists: table',
            docs: docs
        });
    })
    .catch(err => {
        console.log(err);
    })

})

//router is an express object
router.get('/:listId', (req, res, next) => {
    List.findById(req.params.listId) //findById is Mongoose
    .populate('items') //mongoose
    .then(list => { //then is a promise, comes from ES6 (node/javascript)
        if(list) {
            res.status(200).json({list}); //res.status express/javascript
        } else {
            res.status(404).json({message: 'No valid entry found for provided id'});
        }
    })
    .catch(err => {// catch is a piece of the promise structure
        res.status(500).json({error: err});
    })
})

router.post('/create', (req, res, next) => {
    List.find({ name: req.body.name }) 
    .then(list => {
        if (list.length >= 1) {
        //conflict 409 or unprocessable 
            return res.status(409).json({
                message: 'List with this name is already in the database'
            });
        } else {
            const list = new List({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                description: req.body.description
            })
            //did not include the bash-- encrypt function -- don't see a need 
            // const list = new List({
            //     //creates a unique id for the new item 
            //     _id: new mongoose.Types.ObjectId(),
            //     name: req.body.name,
            //     item_count: req.body.item_count,
            //    // adddate: req.body.adddate,
            //     current_total_cost: req.body.price,
            //    // description: req.body.description
            // }); 
            //save new item 
            list.save()
            .then(result => {
                console.log(result);
                //201, successful, resource created
                res.status(201).json({
                    message: 'List ' + result.name + ' was created!',
                    createdItem: {
                        name: result.name,
                        item_count: result.item_count,
                        adddate: result.adddate,
                        current_total_cost: result.current_total_cost,
                        description: result.description,
                        items: result.items
                    }
                });
            })
            .catch(err => {
                res.status(500).json("On save " + err);
            });            
        }
    })
    .catch(err => {
        res.status(500).json({error: err});
    })
})

router.delete('/delete', (req, res, next) => {
    const itemId = req.body.itemId;
    Item.findById(req.body.itemId)
        .then(user => {
            if (user) {
                List.deleteOne({ _id: user._id}, { $pull: { items: docs._id }, $inc: { current_total_cost: -docs.price, item_count: -1 }})
                Item.remove({ _id: itemId })
                    .then(result => {
                        res.status(200).json({
                            message: 'Item' + user.name + 'was deleted',
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            } else {
                res.status(404).json({ message: 'No valid entry' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err }); 
    })
})
module.exports = router;