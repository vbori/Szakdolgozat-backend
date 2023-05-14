import Token from '../models/Token.js';
import { findToken, addToken, deleteToken } from '../services/token.service.js';
import { findResearcherByUsername } from '../services/researcher.service.js';

import jsonwebtoken from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const { verify, sign } = jsonwebtoken;
const { compare } = bcryptjs;

export const refreshToken = async (req, res) => {
    try{
        if (req.cookies.refreshToken == null) return res.sendStatus(401);
        const refreshToken = await findToken(req.cookies.refreshToken);
        if (!refreshToken){
            console.log("Refresh token not found")
            return res.status(403).json({ message: 'Refresh token not found' });
        }else{
            const decoded = verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const accessToken = generateAccessToken({ _id: decoded._id });
            res.status(201).json(accessToken);
        }
    }catch(err){
        console.log(`Error in finding refresh token: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }else if(err.name === 'TokenExpiredError'){
            return res.status(403).send('Refresh token expired');
        }
        res.status(500).send('Error in finding refresh token');
    }
}

export const login = async (req, res) => {
    try {
        const researcher = await findResearcherByUsername(req.body.username);

        if (!researcher) {
            return res.status(401).send('Authentication failed');
        }else if(await compare(req.body.password, researcher.password)) {
            const user = {_id: researcher._id};
            const accessToken = generateAccessToken(user);
            const refreshToken = sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME });
            const newRefreshToken = new Token({
                token: refreshToken
            });

            await addToken(newRefreshToken);
            console.log('Refresh token saved');
            res.cookie('refreshToken', refreshToken, { 
                httpOnly: true, 
                maxAge: 24 * 60 * 60 * 1000 });
            return res.status(201).json(accessToken); 
        } else {
            res.status(401).send('Authentication failed');
        }
    } catch(err) {
        console.log(`Error during authentication: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error during authentication');
    }
}

export const logout = async (req, res) => {
    try{
        if (req.cookies.refreshToken == null) return res.sendStatus(401);
        const refreshToken = await findToken(req.cookies.refreshToken);
        if (!refreshToken){
            return res.clearCookie('refreshToken', { httpOnly: true }).status(403).send('Refresh token not found');
        }else{
            await deleteToken(refreshToken);
            console.log('Refresh token deleted', refreshToken);
            return res.clearCookie('refreshToken', { httpOnly: true }).status(204).json({ message: 'Logout successful' });
        }
    }catch(err){
        console.log(`Error during logout: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error during logout');
    }
}

function generateAccessToken(user) {
    return sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME });
}