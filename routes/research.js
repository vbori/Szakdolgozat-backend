require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt   = require('bcryptjs');

const Researcher = require('../models/researcher');

router.get('/', async (req, res) => {
    res.send(req.user.name);
});

router.patch('/changePassword', async (req, res) => {
    try {
        const researcher = await Researcher.findResearcherByUsername(req.body.username);

        if (!researcher) {
            return res.status(400).json({message:'Cannot find user'});
        }

        if(await bcrypt.compare(req.body.oldPassword, researcher.password)) {
            Researcher.changePassword(researcher, req.body.newPassword, (err) => {
                if (!err) {
                    res.status(200).json({message:'Password changed'});
                } else {
                    res.status(500).json({message:'Password not changed'});
                    console.log('Error in researcher save: ' + JSON.stringify(err, undefined, 2));
                }
            });
        } else {
            res.status(401).json({message:'Not Allowed'});
        }
    } catch (err){
        res.status(500).send();
    }
});

module.exports = router;