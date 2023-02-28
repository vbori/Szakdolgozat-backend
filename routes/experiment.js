require('dotenv').config();
const express = require('express');
const router = express.Router();

const Participant = require('../models/participant');
const Experiment = require('../models/experiment');
const Form = require('../models/form');

router.get('/participants', async (req, res) => {
    try{
        let participants = await Participant.findParticipantsByExperimentId(req.body.experimentId);
        res.status(200).json(participants);
    }
    catch(err){
        res.status(500).json({message:'Error in finding participants'});
    } 
});

module.exports = router;