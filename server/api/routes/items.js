const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const mongoose = require('mongoose');
const axious = require('axios');
const List = require('../models/list');

router.get('/', (req, res, next) => {
    Item.find()
    .exec()
    .then(docs => {
        console.log(docs);
        return res.status(201).json({ 
            message: 'Items: table',
            docs: docs
        });
    })
    .catch(err => {
        console.log(err);
    })

})
//test
// /add, /update, /delete, /:itemId
router.post('/add', (req, res, next) => {
    const listId = req.body.listId;
    List.findById(listId)
        .then(user => {
        if(!user) {
            return res.status(404).json({
                message: "List not found"
            });
        } else {
            const item = new Item({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                sourcelink: req.body.sourcelink,
                adddate: req.body.adddate,
                price: req.body.price,
                description: req.body.description
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
                            createdRoom: {
                                _id: result.id,
                                name: result.name,
                                description: result.description,
                                sourcelink: result.sourcelink,
                                adddate: result.adddate,
                                price: result.price
                            }
                        });
                        List.updateOne({_id: doc._id}, {$inc: {item_count: 1}})
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
});

router.get('/:itemId', (req, res, next) => {
    Item.findById(req.params.itemId) //name seemed like the only unique variable to use 
    .exec()
    .then(item => {
        if(item) {
            res.status(200).json({item});
        } else {
            res.status(404).json({message: 'No valid entry found for provided id'});
        }
    })
    .catch(err => {
        res.status(500).json({error: err});
    })
    // res.status(200).json({
    //     message: 'You passed an ID',
    //     retrievedItem: {
    //         name: result.name,
    //         sourcelink: result.sourcelink,
    //         adddate: result.adddate,
    //         price: result.price,
    //         description: result.description 
    //     }
    //     //essentially you'd want to return the item searched for by id I am guessing? 
    // }); 
})

router.patch('/update/:itemId', (req, res, next) => {
    const id = req.params.itemId;
    const updateOps = {};
    // build array of value pairs that need updating in database
    // must make body request iterable for this to work
    for (const key of Object.keys(req.body)) {
        updateOps[key] = req.body[key];
      }
    Item.updateOne({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch( err => {
        res.status(500).json({
            error: err
        });
    });
})

router.delete('/:itemId', (req, res, next) => {
    Item.findById(req.params.itemId) 
    .exec()
    .then(item => {
        if(item) {
            Item.remove({_id: req.params.itemId})
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
    
    // res.status(200).json({
    //     message: 'Deleted product',
    //     id: id
    //     //essentially you'd want to return the item searched for by id I am guessing? 
    // }); 
})


module.exports = router;
