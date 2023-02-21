const express = require('express');
const router = express.Router();

const Researcher = require('../models/researcher');
const Participant = require('../models/participant');

router.post('/researcher', async (req, res) => {
    const researcher = await Researcher.findResearcherByUsername(req.body.username);

    if (researcher) {
      return res.status(400).send('Username already exists');
    }

    try {
        let newResearcher = new Researcher({
            username: req.body.username,
            password: req.body.password,
            experiments: [],
            liveExperimentCount: 0
        });

        Researcher.addResearcher(newResearcher, (err, researcher) => {
            if (!err) {
                res.status(201).send(researcher);
            } else {
                console.log('Error in researcher save: ' + JSON.stringify(err, undefined, 2));
            }
        });
    } catch {
        res.status(500).send();
    }
});

router.post('/participant', async (req, res) => {
    try {
        let newParticipant = new Participant({
            experimentId: req.body.experimentId,
            inControlGroup: req.body.inControlGroup
        });

        Participant.addParticipant(newParticipant, (err, participant) => {
            if (!err) {
                res.status(201).send(participant);
            } else {
                console.log('Error in participant save: ' + JSON.stringify(err, undefined, 2));
            }
        });
    } catch {
        res.status(500).send();
    }
});

module.exports = router;