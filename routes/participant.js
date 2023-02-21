require('dotenv').config();
const express = require('express');
const router = express.Router();

const Participant = require('../models/participant');

router.get('/', async (req, res) => {
    try{
        let participants = await Participant.findParticipantsByExperimentId(req.body.experimentId);
        res.status(200).json(participants);
    }
    catch(err){
        res.status(500).json({message:'Error in finding participants'});
    } 
});

router.patch('/addresponses', async (req, res) => {
    Participant.addResponses(req.body.participantId, req.body.responses, (err) => {
        if (!err) {
            res.status(200).json({message:'Responses added'});
        } else {
            res.status(500).json({message:'Responses not added'});
            console.log(`Error in response save: ${err}`);
        }
    });
});


module.exports = router;