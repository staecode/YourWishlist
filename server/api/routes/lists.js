const express = require('express');
const router = express.Router(); //object
const List = require('../models/list');
const mongoose = require('mongoose');
const Item = require('../models/item');
const User = require('../models/user');
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
            res.status(200).json({
                list_name: list.name,
                description: list.description,
                current_total_cost: list.current_total_cost,
                items: list.items.map(item => {
                    return {
                        item: {
                            name: item.name,
                            price: item.price,
                            img: item.img,
                            request: {
                                type: 'GET',
                                description: 'link to item page',
                                url: 'http://localhost:3000/items/' + item._id
                            }
                        }
                    }
                })
            })
        } else {
            res.status(404).json({message: 'No valid entry found for provided id'});
        }
    })
    .catch(err => {// catch is a piece of the promise structure
        res.status(500).json({error: 'in error ' + err});
    })
})

router.post('/create', (req, res, next) => {
    const userId = req.body.userId;
    User.findById(userId)
    .then(user => {
        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        } else {
            const list = new List({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                description: req.body.description
            })
            return list.save()
        }
    })
    .then(result => {
        User.findById(userId)
            .exec()
            .then(user => {
                if(user) {
                    User.updateOne({_id: user._id}, {$push: {lists: result._id}})
                    .exec()
                    .then(added => {
                        res.status(201).json({
                            message: 'List ' + result.name + ' was created!',
                            createdList: {
                                _id: result.id,
                                name: result.name,
                                description: result.description
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

router.delete('/:listId', (req, res, next) => {
    const userId = req.body.userId;
    User.findById(userId)
    .then(user => {
        if(!user) {
            res.status(404).json({ message: 'No valid entry found for this User Id' });
        } else {
            const listId = req.params.listId;
            List.findById(listId)
            .then(list => {
                if(list) {
                    User.updateOne({ _id: user._id }, { $pull: { lists: list._id }})
                    .then(response => {
                        List.remove({_id: listId})
                        .then(result => {
                            res.status(200).json({ message: 'List ' + list.name + ' was deleted', });
                        })
                        .catch(err => {
                            res.status(500).json({ error: err });
                        });
                    })
                } else {
                    res.status(404).json({ message: 'No valid entry of List Id' });
                }
            })
            .catch(err => {
                res.status(500).json({ error: "Found user, then: " + err });
            })
        }
    })
    .catch(err => {
        res.status(500).json({ error: "Did not find user: " + err });
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
    if(!req.error) {
        const listId = req.body.listId;
        console.log(listId);
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
                                    img: result.img.userId,                        
                                    request: {
                                        type: 'GET',
                                        description: 'link to list page',
                                        url: 'http://localhost:3000/items/' + result._id
                                    }
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
    } else {
        console.log(err);
        res.status(500).json({error: req.error});
    }
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
            Item.findById(itemId)
            .then(item => {
                if (item) {
                    List.updateOne({ _id: req.params.listId }, { $pull: { items: item._id }, $inc: { current_total_cost: -user.price, item_count: -1 } })
                    .then(response => {
                        Item.remove({ _id: itemId })
                            .then(result => {
                                res.status(200).json({ message: 'Item ' + item.name + ' was deleted', });
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