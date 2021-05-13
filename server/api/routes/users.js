const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res, next) => {
    User.find()
    .exec()
    .then(docs => {
        console.log(docs);
    })
    .catch(err => {
        console.log(err);
    })
})

router.post('/register', (req, res, netxt) => {
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
                        res.status(500).json({error: err});
                    });            
                }
            });
        }
    })
    .catch(err => {
        res.status(500).json({error:err});
    })
})

module.exports = router;