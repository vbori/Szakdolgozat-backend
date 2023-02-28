require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt   = require('bcryptjs');

const Researcher = require('../models/researcher');
const Form = require('../models/form');
const ObjectId = require('mongodb').ObjectId; 
const Participant = require('../models/participant');
const Experiment = require('../models/experiment');

router.get('/', async (req, res) => {
    Experiment.getExperimentsByResearcherId(req.body.researcherId, (err, experiments) => {
        if (!err) {
            res.status(200).json(experiments);
        } else {
            res.status(500).json({message:'Error in experiment find'});
            console.log('Error in experiment find: ' + JSON.stringify(err, undefined, 2));
        }
    });
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
            experimentId: ObjectId(req.body.experimentId),
            questions: req.body.questions
        });

        Form.addForm(newForm, (err, form) => {
            if (!err) {
                Experiment.updateExperiment(req.body.experimentId, { $set: { formId: form._id } }, (err) => {
                    if(!err) {
                        res.status(201).send(form);
                    } else {
                        console.log('Error in experiment update: ' + JSON.stringify(err, undefined, 2));
                        res.status(500).json({message:'Error in saving form'});
                    }
                });
            } else {
                console.log('Error in form save: ' + JSON.stringify(err, undefined, 2));
                throw err;
            }
        });
    } catch {
        res.status(500).json({message:'Error in saving form'});
    }
});

router.get('/getForm', async (req, res) => {
    try{
        let form = await Form.findFormByExperimentId(req.body.experimentId);
        res.status(200).json(form);
    } catch (err){
        res.status(500).json({message:'Error in getting form'});
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

router.post('/addExperiment', async (req, res) => {
    
    let newExperiment = new Experiment({
        researcherId: ObjectId(req.body.researcherId),
        name: req.body.name,
        type: req.body.type,
        status: "Draft",
        participantNum: 0,
        maxParticipantNum: req.body.maxParticipantNum,
        controlGroupSize: req.body.controlGroupSize,
        trajectoryImageNeeded: req.body.trajectoryImageNeeded,
        positionArrayNeeded: req.body.positionArrayNeeded,
        researcherDescription: req.body.researcherDescription,
        participantDescription: req.body.participantDescription,
        rounds: []
    });

    Experiment.addExperiment(newExperiment, (err, experiment) => {
        if(!err){
            res.status(201).send(experiment);
        }else{
            res.status(500).json({message: 'Experiment not added'});
        }
    });
    
});

router.delete('/deleteExperiment', async (req, res) => {
    Participant.deleteParticipants(req.body.experimentId, (err) => {
        if (!err) {
            Form.deleteForm(req.body.experimentId, (err) => {
                if (!err) {
                    Experiment.deleteExperiment(req.body.experimentId, (err) => {
                        if (!err) {
                            res.status(200).json({message:'Experiment deleted'});
                        } else {
                            res.status(500).json({message:'Experiment not deleted'});
                            console.log('Error in experiment delete: ' + JSON.stringify(err, undefined, 2));
                        }
                    });
                } else {
                    res.status(500).json({message:'Experiment not deleted'});
                    console.log('Error in form delete: ' + JSON.stringify(err, undefined, 2));
                }
            });
        } else {
            res.status(500).json({message:'Experiment not deleted'});
            console.log('Error in participant delete: ' + JSON.stringify(err, undefined, 2));
        }
    });
});

router.patch('/editExperiment', async (req, res) => {
    Experiment.updateExperiment(req.body.experimentId, req.body.updatedExperiment, (err, experiment) => {
        if (!err) {
            res.status(200).send(experiment);
        } else {
            res.status(500).json({message:'Experiment not updated'});
            console.log('Error in experiment update: ' + JSON.stringify(err, undefined, 2));
        }
    });
});

router.get('/getExperiment', async (req, res) => {
    Experiment.getExperimentById(req.body.experimentId, (err, experiment) => {
        if (!err) {
            res.status(200).send(experiment);
        } else {
            res.status(500).json({message:'Experiment not found'});
            console.log('Error in experiment find: ' + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;