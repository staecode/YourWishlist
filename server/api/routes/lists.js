const express = require('express');
const router = express.Router(); //object
const List = require('../models/list');
const mongoose = require('mongoose');
const Item = require('../models/item');
const scraper = require('../middleware/scraper');

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

router.delete('/:listId', (req, res, next) => {
    List.findById(req.params.listId) 
    .exec()
    .then(list => {
        if(list) {
            List.remove({_id: req.params.listId})
            .exec()
            .then(result => {
                res.status(200).json(result);
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        } else {
            res.status(404).json({message: 'No valid entry found for provided id'});
        }
    })
    .catch(err => {
        res.status(500).json({error: err});
    })   
})

router.patch('/setTotal/:listId', (req, res, next) => {
    const listId = req.params.listId;
    const total = req.body.total;
    List.findById(listId)
    .then(list => {
        if(list) {
            List.updateOne({_id: listId}, {$set: {current_total_cost: total}})
            .then(result => { 
                res.status(200).json({message: 'List price set to ' + req.body.total});
            })
            .catch(err => {
                res.status(500).json({error: "Error setting list price"});
            })
        } else {
            res.status(404).json({message: 'No valid entry found for this List Id'});
        }
    })
})

router.patch('/setCount/:listId', (req, res, next) => {
    const listId = req.params.listId;
    const count = req.body.count;
    List.findById(listId)
    .then(list => {
        if(list) {
            List.updateOne({_id: listId}, {$set: {item_count: count}})
            .then(result => { 
                res.status(200).json({message: 'List count set to ' + req.body.count});
            })
            .catch(err => {
                res.status(500).json({error: "Error setting list count"});
            })
        } else {
            res.status(404).json({message: 'No valid entry found for this List Id'});
        }
    })
})

router.patch('/clearList/:listId', (req, res, next) => {
    const listId = req.params.listId;
    List.findById(listId)
    .then(list => {
        if(list) {
            List.updateOne({_id: listId}, {$set: {items: [], current_total_cost: 0, item_count:0}})
            .then(result => {
                res.status(200).json({message: 'List cleared of items'});
            })
            .catch(err => {
                res.status(500).json({error: "Error clearing list"});
            })
        } else {
            res.status(404).json({message: 'No valid entry found for this List Id'});
        }
    })
})

router.post('/addItem', scraper, (req, res, next) => {
    const listId = req.body.listId;
    List.findById(listId)
        .then(list => {
        if(!list) {
            return res.status(404).json({
                message: "List not found"
            });
        } else {
            const item = new Item({
                _id: new mongoose.Types.ObjectId(),
                name: req.item.name,
                sourcelink: req.body.url,
                price: req.item.price,
                description: req.item.description,
                img: req.item.imagehref
            })
            return item.save();
        }
    })
    .then(result => {
        List.findById(listId)
            .exec()
            .then(doc => {
                if(doc) {
                    List.updateOne({_id: doc._id}, {$push: {items: result._id}, $inc: {current_total_cost: result.price, item_count: 1}})
                    .exec()
                    .then(added => {
                        res.status(201).json({
                            message: 'Item ' + result.name + ' was created!',
                            createdItem: {
                                _id: result.id,
                                name: result.name,
                                description: result.description,
                                sourcelink: result.sourcelink,
                                price: result.price,
                                img: result.img
                            }
                        });
                        
                    })
                    .catch(err_add => {
                        console.log(err_add);  
                    })
                }
            })
    })     
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
    
})

router.delete('/deleteItem/:listId', (req, res, next) => {
    //works in current state, but we need to rearrange to the following logic flow:
    // - check if list exists
    // - if list does not exist, exit
    // - if list exists, check to see if item is on list
    // - if it isnt, exit
    // - if item on list, update through pull/inc
    // - check if item exists in database
    // - if it doesn't, exit
    // - if it does, delete, return success message
    List.findById(req.params.listId)
    .then(list => {
        if (!list) {
            res.status(404).json({ message: 'No valid entry found for this List Id' });
        }
        else {
            const itemId = req.body.itemId;
            console.log(itemId);
            Item.findById(itemId)
            .then(user => {
                if (user) {
                    console.log(user);
                    List.updateOne({ _id: req.params.listId }, { $pull: { items: user._id }, $inc: { current_total_cost: -user.price, item_count: -1 } })
                    .then(response => {
                        Item.remove({ _id: itemId })
                            .then(result => {
                                res.status(200).json({ message: 'Item ' + user.name + ' was deleted', });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            });
                        })
                    .catch(err => {
                        res.status(500).json({ message: 'List update not successful ' + err });
                    });
                } else {
                    res.status(404).json({ message: 'No valid entry of Item Id' });
                }
            })
            .catch(err => {
                res.status(500).json({ error: err });
            })
            }
    })
    .catch(err => {
        res.status(500).json({ error: err });
    })
})
module.exports = router;