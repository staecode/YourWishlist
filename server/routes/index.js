var express = require('express');
var router = express.Router();
const { body,validationResult } = require('express-validator');

// GET home page.
router.get('/', function(req, res) {
 // res.redirect('/userLists');
  res.render('login', { error: false }); 
});

//GET register page
router.get('/register', function (req, res) {
  res.render('register', { error: false })
}); 


const axios = require('axios');
const { listIndexes } = require('../api/models/item');

// GET home page.
router.get('/userLists/:userId', function(req, res) {
    const userId = req.params.userId;
    let lists = [];

    let userlists = 'http://localhost:5000/users/userLists/' + userId;

    (async () => {
        try {
        const response = await axios.get(`${userlists}`);
        for(let i = 0; i < response.data.lists.length; i++) {
            lists.push(response.data.lists[i].list);
        }
        } catch (error) {
            lists.push(error);
        }
        res.render('userList', {title: 'Your Wishlist', heading: 'Your Wishlists', results: lists})
    })();
})

router.get('/createList/:userId', function(req, res) {
    res.render('createList', {title: 'Create New List', userId: req.params.userId});
})

router.post('/createList/:userId', function(req, res) {

  (async () => {
      try {
        let createList = 'http://localhost:5000/lists/create';
        const response = await axios({
          method: 'POST',
          url: `${createList}`, 
          data: {
            name: req.body.name,
            description: req.body.description,
            userId: req.body.userId
          }
        });
        if(response) {
          res.render('createList', {title: 'Create New List', userId: req.body.userId, message: response.data.message});
        } 
      } catch (error) {
        res.render('createList', {title: 'Create New List', userId: req.body.userId, message: error + '. Error creating list. Please try again.'});
      }
    })();
})
  

router.get('/lists/:listId/:userId', (req, res) => {
  const userId = req.params.userId;
  const listId = req.params.listId;
   try {
    let getList = 'http://localhost:5000/lists/' + listIndexes;
  } catch (error) {
      res.render('userList/' + userId, {title: 'Your WishLists', message: error + '. Error oprening list. Please try again.'});
    }
})

module.exports = router;
