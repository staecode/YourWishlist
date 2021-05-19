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

router.get('/:listId', (req, res, next) => {
    List.findById(req.params.listId)
    .populate('items') 
    .then(list => {
        if(list) {
            res.status(200).json({list});
        } else {
            res.status(404).json({message: 'No valid entry found for provided id'});
        }
    })
    .catch(err => {
        res.status(500).json({error: err});
    })
})

router.post('/create', (req, res, next) => {
    List.find({ name: req.body.name }) 
    .exec()
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
                    message: 'List' + result.name + 'was created!',
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

module.exports = router;