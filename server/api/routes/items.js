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
                    message: 'Item' + result.name + 'was created!',
                    createdItem: {
                        name: result.name,
                        sourcelink: result.sourcelink,
                      //  adddate: result.adddate,
                        price: result.price,
                        description: result.description,
                        
                    }
                });
            })
            .catch(err => {
                res.status(500).json("On save");
            });            
        }
        
    })
    .catch(err => {
        res.status(500).json({error: err});
    })
})


router.get('/:itemId', (req, res, next) => {
    const id = req.params.itemId;
    res.status(200).json({
        message: 'You passed an ID',
        id: id
        //essentially you'd want to return the item searched for by id I am guessing? 
    }); 
})

router.delete('/:itemId', (req, res, next) => {
    res.status(200).json({
        message: 'Deleted product',
        id: id
        //essentially you'd want to return the item searched for by id I am guessing? 
    }); 
})


module.exports = router;