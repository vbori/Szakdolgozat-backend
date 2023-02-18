require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken')
const session = require('express-session')
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.DATABASE, (err) => {
    if (!err)
        console.log('MongoDB connection succeeded.');
    else
        console.log('Error in DB connection : ' + JSON.stringify(err, undefined, 2));
});

const app = express();
const Researcher = require('./models/researcher');
const RefreshToken = require('./models/refreshToken');

app.use(bodyParser.json());
app.use(session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.post('/token', async (req, res) => {
    if (req.body.token == null) return res.sendStatus(401);
    const refreshToken = await RefreshToken.findRefreshToken(req.body.token);
    if (!refreshToken) return res.status(403).json({ message: 'Refresh token not found' });
    jwt.verify(req.body.token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.setatus(403).json({ message: 'Refresh token verification failed' })
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
});

app.post('/login', async (req, res) => {
    const researcher = await Researcher.findResearcherByUsername(req.body.username);

    if (!researcher) {
      return res.status(400).send('Cannot find user')
    }

    try {
        if(await bcrypt.compare(req.body.password, researcher.password)) {
            const user = {name: req.body.username}
            const accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME })
            const newRefreshToken = new RefreshToken({
                token: refreshToken
            });

            RefreshToken.addRefreshToken(newRefreshToken, (err, doc) => {
                if (!err) {
                    console.log('Refresh token saved');
                    res.json({ accessToken: accessToken, refreshToken: refreshToken })
                } else {
                    console.log('Error in refresh token save: ' + JSON.stringify(err, undefined, 2));
                }
            });
            
        } else {
            res.send('Not Allowed')
        }
    } catch {
        res.status(500).send()
    }
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME })
}

app.listen(process.env.AUTH_PORT, () => console.log('Server started at port : ' + process.env.AUTH_PORT));