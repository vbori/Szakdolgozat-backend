const express = require('express');
const router = express.Router();
const bcrypt   = require('bcryptjs');

const Researcher = require('../models/researcher');

router.get('/', async (req, res) => {
    res.send(req.user.name);
});

router.post('/changePassword', async (req, res) => {
    const researcher = await Researcher.findResearcherByUsername(req.user.name);
    if (!researcher) {
        return res.status(400).send('Cannot find user');
    }

    try {
        if(await bcrypt.compare(req.body.oldPassword, researcher.password)) {
            Researcher.changePassword(researcher, req.body.newPassword, (err, doc) => {
                if (!err) {
                    res.send('Password changed');
                } else {
                    console.log('Error in researcher save: ' + JSON.stringify(err, undefined, 2));
                }
            });
        } else {
            res.send('Not Allowed');
        }
    } catch {
        res.status(500).send();
    }
});

module.exports = router;