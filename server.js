const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/database');
const researchController = require('./routes/research.js');

mongoose.connect(config.database, (err) => {
    if (!err)
        console.log('MongoDB connection succeeded.');
    else
        console.log('Error in DB connection : ' + JSON.stringify(err, undefined, 2));
});

const app = express();
app.use(express.json());

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({ origin: 'http://localhost:4200' }));

app.listen(3000, () => console.log('Server started at port : 3000'));


app.use('/research', researchController);