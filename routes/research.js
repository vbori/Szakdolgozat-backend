const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const Researcher = require('../models/researcher');

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

module.exports = router;