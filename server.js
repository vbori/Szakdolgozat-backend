import {config} from 'dotenv';
import express from 'express';
import bodyparser from 'body-parser';
import cors from 'cors';
import { set, connect } from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import researchController from './routes/research.js';
import registerController from './routes/register.js';
import participantController from './routes/participant.js';
import authController from './routes/auth.js';
import verifyJWT from './middleware/verifyJWT.js';

config();

set('strictQuery', false);
connect(process.env.DATABASE, (err) => {
    if (!err)
        console.log('MongoDB connection succeeded.');
    else
        console.log('Error in DB connection : ' + JSON.stringify(err, undefined, 2));
});

const app = express();

app.use(cookieParser());
app.use(bodyparser.json());
app.use(cors({ origin: process.env.CORS_ORIGIN , credentials: true}));
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: true, 
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.listen(process.env.SERVER_PORT, () => console.log('Server started at port : ' + process.env.SERVER_PORT));

app.use('/register', registerController);
app.use('/auth', authController);
app.use('/participant', participantController);

app.use(verifyJWT);
app.use('/research', researchController);