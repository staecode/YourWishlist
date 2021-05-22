const express = require('express'); // package added via npm
const morgan = require('morgan'); // logging
const bodyParser = require('body-parser'); // parse requests - url encoded or json
const mongoose = require('mongoose'); // database interface tool
const http = require('http');
// adding a comment

const PORT = process.env.PORT || 5000;

const app = express();
app.use((req, res, next) => {
    // set header to append access header to all responses
    res.header('Access-Control-Allow-Origin', '*');
    // set header permissions
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Headers, Access-Control-Request-Method, Access-Control-Request-Headers');
    // give option answer to browser
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
        res.status(200).json({});
    }
    // move on
    next();
})
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

process.on('warning', (warning) => {
    console.warn(warning.name);    // Print the warning name
    console.warn(warning.message); // Print the warning message
    console.warn(warning.stack);   // Print the stack trace
});

mongoose.connect(
    'mongodb+srv://Staecode:' + 
    process.env.MONGO_ATLAS_PW + 
    '@cluster0.nmmfj.mongodb.net/yourwishlist?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
);

const userRoutes = require('./api/routes/users');
app.use('/users', userRoutes);
const itemRoutes = require('./api/routes/items');
app.use('/items', itemRoutes);
const listRoutes = require('./api/routes/lists');
app.use('/lists', listRoutes);

app.use((req, res, next) => {
    // create error object
    const error = new Error('Not Found');
    error.status = 404;
    // pass error along to next handle
    next(error);
});
// 600 errors will reach this error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

const server = http.createServer(app);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));