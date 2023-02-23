require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt   = require('bcryptjs');

const Researcher = require('../models/researcher');
const Form = require('../models/form');
const ObjectId = require('mongodb').ObjectId; 
const Participant = require('../models/participant');

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

router.post('/addForm', async (req, res) => {
    try {
        let newForm = new Form({
            researcherId: ObjectId(req.body.researcherId),
            experimentId: req.body.experimentId,
            questions: req.body.questions
        });

        Form.addForm(newForm, (err, form) => {
            if (!err) {
                res.status(201).send(form);
            } else {
                console.log('Error in form save: ' + JSON.stringify(err, undefined, 2));
                throw err;
            }
        });
    } catch {
        res.status(500).send();
    }
});

router.get('/getForm', async (req, res) => {
    try{
        let form = await Form.findFormByExperimentId(req.body.experimentId);
        res.status(201).json(form);
    } catch (err){
        res.status(500).send();
    }
});

router.patch('/editForm', async (req, res) => {
    Form.editForm(req.body.experimentId, req.body.questions, (err) => {
        if (!err) {
            res.status(200).json({message:'Form edited'});
        } else {
            res.status(500).json({message:'Form not edited'});
            console.log('Error in form edit: ' + JSON.stringify(err, undefined, 2));
        }
    });
});

router.delete('/deleteExperiment', async (req, res) => {
    Form.deleteForm(req.body.experimentId, (err) => {
        if (!err) {
            Participant.deleteParticipants(req.body.experimentId, (err) => {
                if (!err) {
                    res.status(200).json({message:'Experiment deleted'});
                } else {
                    res.status(500).json({message:'Experiment not deleted'});
                    console.log('Error in participant delete: ' + JSON.stringify(err, undefined, 2));
                }
            });
        } else {
            res.status(500).json({message:'Experiment not deleted'});
            console.log('Error in form delete: ' + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;