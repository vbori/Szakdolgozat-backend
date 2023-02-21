require('dotenv').config();
const express = require('express');
const router = express.Router();

const Participant = require('../models/participant');

router.delete('/deleteExperiment', async (req, res) => {
    Participant.deleteParticipants(req.body.experimentId, (err) => {
        if (!err) {
            res.status(200).json({message:'Participants deleted'});
        } else {
            res.status(500).json({message:'Participants not deleted'});
            console.log('Error in participant delete: ' + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;