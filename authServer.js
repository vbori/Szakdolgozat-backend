import {config} from 'dotenv';
import express from 'express';
import bodyparser from 'body-parser';
import cors from 'cors';
import { set, connect } from 'mongoose';
import passport from 'passport';
import jsonwebtoken from 'jsonwebtoken';
import session from 'express-session';
import bcryptjs from 'bcryptjs';

import {findResearcherByUsername} from './models/researcher.js';
import RefreshToken, {findRefreshToken, addRefreshToken, deleteRefreshToken} from './models/refreshToken.js';

config();

set('strictQuery', false);
connect(process.env.DATABASE, (err) => {
    if (!err)
        console.log('MongoDB connection succeeded.');
    else
        console.log(`Error in DB connection : ${err}`);
});

const { verify, sign } = jsonwebtoken;
const { compare } = bcryptjs;
const app = express();

app.use(bodyparser.json());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(session({ 
    secret: process.env.AUTH_SESSION_SECRET,
    resave: true, 
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.listen(process.env.AUTH_PORT, () => console.log('Server started at port : ' + process.env.AUTH_PORT));

app.post('/token', async (req, res) => {
    try{
        if (req.body.token == null) return res.sendStatus(401);
        const refreshToken = await findRefreshToken(req.body.token);
        if (!refreshToken){
            return res.status(403).json({ message: 'Refresh token not found' });
        }else{
            const decoded = verify(req.body.token, process.env.REFRESH_TOKEN_SECRET);
            const accessToken = generateAccessToken({ _id: decoded._id });
            res.status(201).send(accessToken);
        }
    }catch(err){
        res.status(500).json({message:'Error in finding refresh token'});
        console.log(`Error in finding refresh token: ${err}`);
    }
});

app.post('/login', async (req, res) => {
    try {
        const researcher = await findResearcherByUsername(req.body.username);

        if (!researcher) {
            return res.sendStatus(401);
        }else if(await compare(req.body.password, researcher.password)) {
            const user = {_id: researcher._id};
            const accessToken = generateAccessToken(user);
            const refreshToken = sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME });
            const newRefreshToken = new RefreshToken({
                token: refreshToken
            });

            await addRefreshToken(newRefreshToken);
            console.log('Refresh token saved');
            res.status(201).json({ accessToken: accessToken, refreshToken: refreshToken }); 
        } else {
            res.status(401).json({message:'Authentication failed'});
        }
    } catch(err) {
        res.status(500).json({message:'Error during authentication'});
        console.log(`Error during authentication: ${err}`);
    }
});

app.delete('/logout', async (req, res) => {
    try{
        if (req.query.token == null) return res.sendStatus(401);
        const refreshToken = await findRefreshToken(req.query.token);
        if (!refreshToken){
            return res.status(403).json({ message: 'Refresh token not found' });
        }else{
            await deleteRefreshToken(refreshToken);
            console.log('Refresh token deleted');
            res.sendStatus(204);
        }
    }catch(err){
        res.status(500).json({message:'Error during logout'});
        console.log(`Error during logout: ${err}`);
    }
});

function generateAccessToken(user) {
    return sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME });
}