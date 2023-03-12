import { verify } from 'jsonwebtoken';
import {config} from 'dotenv';
config();

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(403).json({ message: 'Access token verification failed' });
        req.user = user;
        next();
    });
}

export default verifyJWT;