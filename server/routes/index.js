var express = require('express');
var router = express.Router();
const { body,validationResult } = require('express-validator');

// GET home page.
router.get('/', function(req, res) {
  if(!req.headers.cookie) {
      res.redirect('/login');
  } else {
    res.write('Profile coming soon');
    res.end();
  }
})

router.get('/login', function(req, res) {
 // res.redirect('/userLists');
  res.render('login', { error: false }); 
});

//GET register page
router.get('/register', function (req, res) {
  res.render('register', { error: false })
}); 


const axios = require('axios');

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
        res.render('userLists', {title: 'Your Wishlist', heading: 'Your Wishlists', results: lists})
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
          res.render('createList', {title: 'Your Wishlist', heading: 'Create New List', userId: req.body.userId, message: response.data.message});
        } 
      } catch (error) {
        res.render('createList', {title: 'Your Wishlist', heading: 'Create New List', userId: req.body.userId, message: error + '. Error creating list. Please try again.'});
      }
    })();
})
  

router.get('/lists/:listId', (req, res) => {
  const listId = req.params.listId;

  (async () => {
    try {
      let getList = 'http://localhost:5000/lists/' + listId;
      const response = await axios.get(`${getList}`);
      if(response) {
        res.render('itemDisplay', {results: response.data})
      } 
    } catch (error) {
      console.log(error)
    }
  })();

})

router.get('/addToList/:userId', function(req,res) {
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
        res.render('addToList', {title: 'Your Wishlist', heading: 'Add New Item', results: lists})
    })();
})

router.post('/addToList/:userId', function(req, res) {
  const userId = req.params.userId;
  const lists = JSON.parse(req.body.lists);
  (async () => {
    try {
      let createItem = 'http://localhost:5000/lists/addItem';
      const response = await axios({
        method: 'POST',
        url: `${createItem}`, 
        data: {
          url: req.body.url,
          listId: req.body.list
        }
      });
      if(response) {
        res.render('addToList', {title: 'Your Wishlist', heading: 'Add New Item', results: lists, userId: req.body.userId, message: 'Item was added!'});
      } 
    } catch (error) {
      res.render('addToList', {title: 'Your Wishlist', heading: 'Add New Item', results: lists, message: 'Failed to add. ' + error})
    }
  })();
})

module.exports = router;
