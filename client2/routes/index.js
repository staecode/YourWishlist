var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken'); // token creation


// GET home page.
router.get('/', function(req, res) {
  if(req.headers.cookie) {
    const token = req.cookies['user'];
    const decoded = jwt.verify(token, "" + process.env.JWT_KEY, function(err) {
      res.clearCookie('user');
      res.redirect('/login');
    })
    res.redirect('/userLists');
  } else {
    res.redirect('/login');
  }
})

router.get('/login', function(req, res) {
 // res.redirect('/userLists');
  res.render('login', { error: false }); 
});

router.post('/login', function (req, res, next) {
/*  const username = req.body.username;
  let loginResult = login(username, req.body.password);
  
  if (loginResult) {
    res.render('layout', { username: username });
  }

  else {
    res.render('index', { error: true });
  }
*/
  (async () => {
    console.log(req.body)
    try {
      let logincycle = 'http://localhost:5000/users/login';
      const response = await axios({
        method: 'POST',
        url: `${logincycle}`,
        data: {
          email: req.body.email,
          password: req.body.password
        }
      });
      if(response.data) {
        res.setHeader('Set-Cookie', `user=${response.data.token}`);
        res.redirect('/userLists');
      } else {
        next();
      }
    } catch (error) {
      res.render('login', {message: 'Failed to log in ' + error})
    }
  })();
});

//GET register page
router.get('/register', function (req, res) {
  res.render('register', { error: false })
}); 
router.post('/register', function (req, res, next) {
    (async () => {
      console.log(req.body)
      try {
        let registercycle = 'http://localhost:5000/users/register';
        const response = await axios({
          method: 'POST',
          url: `${registercycle}`,
          data: {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          }
        });
        if(response.data) {
          // res.setHeader('Set-Cookie', `user=${response.data.token}`);
          res.redirect('/login');
        } else {
          next();
        }
      } catch (error) {
        res.render('register', {message: 'Failed to register this account' + error})
      }
    })();
  });

router.get('/logout', function (req, res) {
  res.clearCookie('user');
  res.redirect('/');
}); 

const axios = require('axios');

// GET home page.
router.get('/userLists', function(req, res) {
    const token = req.cookies['user'];
    const decoded = jwt.verify(token, "" + process.env.JWT_KEY);
    
    let lists = [];

    let userlists = 'http://localhost:5000/users/userLists/' + decoded.userId;

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

router.get('/createList', function(req, res) {
    const token = req.cookies['user'];
    const decoded = jwt.verify(token, "" + process.env.JWT_KEY);
    res.render('createList', {title: 'Create New List', userId: decoded.userId});
})

router.post('/createList', function(req, res) {
  const token = req.cookies['user'];
  const decoded = jwt.verify(token, "" + process.env.JWT_KEY);

  (async () => {
      try {
        let createList = 'http://localhost:5000/lists/create';
        const response = await axios({
          method: 'POST',
          url: `${createList}`, 
          data: {
            name: req.body.name,
            description: req.body.description,
            userId: decoded.userId
          }
        });
        if(response) {
          res.render('createList', {title: 'Your Wishlist', heading: 'Create New List',  message: response.data.message});
        } 
      } catch (error) {

        res.render('createList', {title: 'Your Wishlist', heading: 'Create New List', message: error + '. Error creating list. Please try again.'});
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

router.get('/addToList', function(req,res) {
    const token = req.cookies['user'];
    const decoded = jwt.verify(token, "" + process.env.JWT_KEY);
    let lists = [];

    let userlists = 'http://localhost:5000/users/userLists/' + decoded.userId;

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

router.post('/addToList', function(req, res) {
  const token = req.cookies['user'];
  const decoded = jwt.verify(token, "" + process.env.JWT_KEY);
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
        res.render('addToList', {title: 'Your Wishlist', heading: 'Add New Item', results: lists, userId: decoded.userId, message: 'Item was added!'});
      } else {
        res.render('addToList', {title: 'Your Wishlist', heading: 'Add New Item', results: lists, message: 'Failed to add. ' + response.data.error})
      }
    } catch (error) {
      res.render('addToList', {title: 'Your Wishlist', heading: 'Add New Item', results: lists, message: 'Failed to add. ' + error})
    }
  })();
})

<<<<<<< HEAD
//this is a get method
// router.get('/userInfo', function(req, res) {
//   const token = req.cookies['user'];
//   const decoded = jwt.verify(token, "" + process.env.JWT_KEY);
//   // add call to backend here to get user's saved info, like the call on 195 in the above function above

//   //this function needs to be inserted into the call you make to the backend, like lines 207 - 214
//   res.render('userInfo', {title: 'User Info', userId: decoded.userId, // pass an object here you grab from the backend with user info});
// })


  // router.post('/userInfo', function(req, res) {
  //   const bodyParser = require('body-parser'); // this is backend code that you don't need here, it's already taken care of
  //   server.use(bodyParser.urlencoded({ extended: false })); // this is backend code that you don't need here, it's already taken care of
  //   server.use(bodyParser.json()); // this is backend code that you don't need here, it's already taken care of
        //look at line 194 down above to see how we get the info and pass it on
  // })


=======
  // router.post('/userInfo', function(req, res) {
  //   const bodyParser = require('body-parser');
  //   server.use(bodyParser.urlencoded({ extended: false }));
  //   server.use(bodyParser.json());
  // })




>>>>>>> 1c60eebf4631d0779709369a7d7d988bb838a911
module.exports = router;
