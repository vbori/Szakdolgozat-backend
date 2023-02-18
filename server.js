require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const researchController = require('./routes/research.js');
const registerController = require('./routes/register.js');
const verifyJWT = require('./middleware/verifyJWT.js');

mongoose.connect(process.env.DATABASE, (err) => {
    if (!err)
        console.log('MongoDB connection succeeded.');
    else
        console.log('Error in DB connection : ' + JSON.stringify(err, undefined, 2));
});

const app = express();

app.use(bodyParser.json());
app.use(session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.listen(process.env.SERVER_PORT, () => console.log('Server started at port : ' + process.env.SERVER_PORT));

app.use('/register', registerController);

app.use(verifyJWT);
app.use('/research', researchController);