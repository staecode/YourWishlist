const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const mongoose = require('mongoose');

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

// /add, /update, /delete, /:itemId
router.post('/add', (req, res, next) => {
    Item.find({ name: req.body.name }) //name seemed like the only unique variable to use 
    .exec()
    .then(item => {
        if (item.length >= 1) {
        //conflict 409 or unprocessable 
            return res.status(409).json({
                message: 'Item with this name is already in the database'
            });
        } else {
            //did not include the bash-- encrypt function -- don't see a need 
            const item = new Item({
                //creates a unique id for the new item 
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                sourcelink: req.body.sourcelink,
               // adddate: req.body.adddate,
                price: req.body.price,
                description: req.body.description
            }); 
            //save new item 
            item.save()
            .then(result => {
                console.log(result);
                //201, successful, resource created
                res.status(201).json({
                    message: 'Item ' + result.name + ' was created!',
                    createdItem: {
                        name: result.name,
                        sourcelink: result.sourcelink,
                        adddate: result.adddate,
                        price: result.price,
                        description: result.description
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
