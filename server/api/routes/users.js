const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt'); // password hashing
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

router.get('/', (req, res, next) => {
    User.find()
    .exec()
    .then(docs => {
        console.log(docs);
        return res.status(201).json({ 
            message: 'Users: table',
            docs: docs
        });
    })
    .catch(err => {
        console.log(err);
    })
})

router.get('/:userId', (req, res, next) => {
    User.findById(req.params.userId) 
    .then(user => {
        if(user) {
            res.status(200).json({user});
            
        } else {
            res.status(404).json({message: 'No valid entry found for provided id'});
        }
    })
    .catch(err => {
        res.status(500).json({error: err});
    })
})

router.post('/login', (req, res, next) => {
    User.find({email: req.body.email}) 
    .exec()
    .then(user => { // empty or one user 'array'
        if(user.length < 1) {
            return res.status(401).json({
                message: 'Authentication Failed on find'
            });
        }
        // compare coming in plain text to stored
        // have to use bcrypt compare because it knows the algorithm
        // for hashing
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    message: 'Authentication Failed on password'
                });
            } 
            if(result) {
                //build element of my json web token
                const token = jwt.sign(
                    {
                        email: user[0].email,
                        userId: user[0]._id
                    }, 
                    "" + process.env.JWT_KEY, 
                    {
                        expiresIn: "1h"
                    }
                );
                return res.status(200).json({
                    message: 'Authentication Successful',
                    token: token,
                    user: {
                        email: user[0].email,
                        _id: user[0]._id
                    }
                });
            }
            // same error message occurs at all levels so as not to 
            // tell user attempting to log in more information than 
            // necessary about credentials, in case it is malicious
            // (password incorrect lets them know they have a 
            // successful username)
            return res.status(401).json({
                message: 'Authentication Failed'
            });
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
})

router.post('/register', (req, res, next) => {
    User.find({email: req.body.email})
    .exec() // creates promise
    .then(user => {
        if(user.length >= 1) {
            // conflict 409 or unprocessable 422
            return res.status(409).json({
                message: 'User with email is already in database'
            });
        } else {
            // now start adding
            // hash password with package
            // dictionary tables exist, database access may be able to get
            // access to simple passwords
            // so salting adds extra characters to strings, to break them up
            // and make them non recognizable 
            // (think discrete structures and encryption - the formulas that 
            // encode and decode can be recreated)
            // seconde parm is "salting rounds"
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({
                        error: err
                    }); 
                } else {
                // get user information
                const user = new User({
                    // auto create unique id
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name, 
                    email: req.body.email,
                    password: hash,
                });
                // save object in database
                    user.save()
                    .then(result => {
                        console.log(result);
                            // 201, successful, resource created
                        res.status(201).json({ 
                        message: 'User ' + result.name + ' was created!',
                        createdUser: {
                            name: result.name,
                            email: result.email,
                            _id: result.id,
                        }
                    });
                    })
                    .catch(err => {
                        res.status(500).json("On save");
                    });            
                }
            });
        }
    })
    .catch(err => {
        res.status(500).json({error: err});
    })
})

router.patch('/update/:userId', (req, res, next) => {
    const id = req.params.userId;
    const updateOps = {};
    // build array of value pairs that need updating in database
    // must make body request iterable for this to work
    for (const key of Object.keys(req.body)) {
        updateOps[key] = req.body[key];
      }
    User.updateOne({_id: id}, {$set: updateOps})
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

router.get('/userLists/:userId', (req, res, next) => {
    const id = req.params.userId;
    User.findById(id)
    .populate('lists')
    .exec()
    .then(doc => {
        res.status(200).json({
            lists: doc.lists.map(list => {
                return {
                    list: {
                        name: list.name,
                        _id: list._id,
                        description: list.description,
                        current_total_cost: list.current_total_cost,
                        request: {
                            type: 'GET',
                            description: 'link to list page',
                            url: 'http://localhost:3000/lists/' + list
                        }
                    }
                }
            })
        });
    })
    .catch(err => {
        // couldn't get data, respond with error
        res.status(500).json({error: err});
    });
})

module.exports = router;