const express = require('express');
const router = express.Router();
const List = require('../models/list');
const mongoose = require('mongoose');

router.get('/', (req, res, next) => {
    List.find()
    .exec()
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

// /add, /update, /delete, /:itemId
router.post('/create', (req, res, next) => {
    List.find({ name: req.body.name }) //name seemed like the only unique variable to use 
    .exec()
    .then(item => {
        if (item.length >= 1) {
        //conflict 409 or unprocessable 
            return res.status(409).json({
                message: 'List with this name is already in the database'
            });
        } else {
            //did not include the bash-- encrypt function -- don't see a need 
            const list = new List({
                //creates a unique id for the new item 
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                item_count: req.body.item_count,
               // adddate: req.body.adddate,
                current_total_cost: req.body.price,
               // description: req.body.description
            }); 
            //save new item 
            list.save()
            .then(result => {
                console.log(result);
                //201, successful, resource created
                res.status(201).json({
                    message: 'List' + result.name + 'was created!',
                    createdItem: {
                        name: result.name,
                        item_count: result.item_count,
                      //  adddate: result.adddate,
                        current_total_cost: result.current_total_cost,
                      //  description: result.description,
                        
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

//router.get('/retrieve')

module.exports = router;