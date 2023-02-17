const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Researcher = require('../models/researcher');

router.get('/', authenticateToken, async (req, res) => {
    res.send(req.user.name)
});

router.post('/register', async (req, res) => {
    try {
        let newResearcher = new Researcher({
            username: req.body.username,
            password: req.body.password,
            experiments: [],
            liveExperimentCount: 0
        });

        Researcher.addResearcher(newResearcher, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else {
                console.log('Error in researcher save: ' + JSON.stringify(err, undefined, 2));
            }
        });
    } catch {
        res.status(500).send()
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

module.exports = router;