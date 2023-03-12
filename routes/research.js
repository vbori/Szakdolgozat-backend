import {config} from 'dotenv';
import { Router } from 'express';
import pkg from 'bcryptjs';
import { ObjectId } from 'mongodb'; 

import {changeOpenExperimentCount, findResearcherById, changePassword} from '../models/researcher.js';
import Form, { addForm, findForm, editForm, deleteForm } from '../models/form.js';
import { deleteParticipants, findParticipantsByExperimentId } from '../models/participant.js';
import Experiment, {getExperimentById, getExperimentsByResearcherId, updateExperiment, addExperiment, deleteExperiment} from '../models/experiment.js';
import {deleteResults, findResultsByExperimentId} from '../models/result.js';

config();
const router = Router();
const { compare } = pkg;

router.get('/', async (req, res) => {
    try{
        const experiments = await getExperimentsByResearcherId(req.user._id);
        res.status(200).json(experiments);
    }catch(err){
        res.status(500).json({message:'Error in finding experiments'});
        console.log(`Error in finding experiment: ${err}`);
    }
});

router.patch('/changePassword', async (req, res) => {
    try{
        const researcher = await findResearcherById(req.user._id);
        if(!researcher) {
            return res.status(400).json({message:'Cannot find user'});
        }
        if(await compare(req.body.oldPassword, researcher.password)) {
            await changePassword(researcher, req.body.newPassword);
            res.status(200).json({message:'Password changed'});
        } else {
            res.status(401).json({message:'Not Allowed'});
        }
    }catch(err){
        res.status(500).json({message:'Password not changed'});
        console.log(`Error in changing password: ${err}`);
    }
});

router.post('/addForm', async (req, res) => {
    try {
        const experiment = await Experiment.findOne({_id: ObjectId(req.body.experimentId), researcherId: ObjectId(req.user._id)});
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            const newForm = new Form({
                researcherId: ObjectId(req.user._id),
                experimentId: ObjectId(req.body.experimentId),
                questions: req.body.questions
            });
            const form = await addForm(newForm);
            await updateExperiment(req.body.experimentId, req.user._id, { $set: { formId: form._id } });
            res.status(201).send({message: 'Form saved', form});
        }
    } catch(err) {
        res.status(500).json({message:'Error in saving form'});
        console.log(`Error in saving form: ${err}`);
    }
});

router.get('/getForm', async (req, res) => {
    try{
        const form = await findForm(req.body.experimentId, req.user._id);
        if(!form) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            res.status(200).json(form);
        }
    }catch(err){
        res.status(500).json({message:'Error in getting form'});
        console.log(`Error in finding form: ${err}`);
    }
});

router.patch('/editForm', async (req, res) => {
    try{
        const form = await editForm(req.body.experimentId, req.user._id, req.body.editedForm);
        if(!form) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            res.status(200).json({message:'Form edited', form: form});
        }
    }catch(err){
        res.status(500).json({message:'Error during editing form'});
        console.log(`Error in editing form: ${err}`);
    }
});

router.post('/addExperiment', async (req, res) => {
    try{
        const newExperiment = new Experiment({
            researcherId: ObjectId(req.user._id),
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
        const experiment = await addExperiment(newExperiment);
        res.status(201).json({message: 'Experiment created', experiment});
    }catch(err){
        res.status(500).json({message: 'Error during experiment creation'});
        console.log(`Error in adding experiment: ${err}`);
    }
});

router.delete('/deleteExperiment', async (req, res) => {
    try{
        const experiment = await Experiment.findOne({_id: ObjectId(req.query.experimentId), researcherId: ObjectId(req.user._id)});
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            await deleteParticipants(req.query.experimentId);
            await deleteForm(req.query.experimentId);
            await deleteResults(req.query.experimentId);
            await deleteExperiment(req.query.experimentId);
            res.status(200).json({message:'Experiment deleted'});
        }
    }catch(err){
        res.status(500).json({message:'Error during experiment deletion'});
        console.log(`Error in deleting experiment: ${err}`);
    }
});

router.patch('/editExperiment', async (req, res) => {
    try{
        const experiment = await updateExperiment(req.body.experimentId, req.user._id, req.body.updatedExperiment);
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            res.status(200).json({message: 'Experiment edited', experiment: experiment});
        }
    }catch(err){
        res.status(500).json({message:'Error during editing experiment'});
        console.log(`Error in updating experiment: ${err}`);
    }
});

router.patch('/openExperiment', async (req, res) => {
    try{
        const experiment = await updateExperiment(req.body.experimentId, req.user._id, { $set: { status: "Active" } });
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            const researcher = await changeOpenExperimentCount(req.user._id, 1);
            res.status(200).json({message:'Experiment opened', experiment: experiment, researcher: researcher});
        }
    }catch(err){
        res.status(500).json({message:'Error - Experiment not opened'});
        console.log(`Error in opening experiment: ${err}`);
    }
});

router.patch('/closeExperiment', async (req, res) => {
    try{
        const experiment = await updateExperiment(req.body.experimentId, req.user._id, { $set: { status: "Closed" } });
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            const researcher = await changeOpenExperimentCount(req.user._id, -1);
            res.status(200).json({message:'Experiment closed', experiment: experiment, researcher: researcher});
        }
    }catch(err){
        res.status(500).json({message:'Error - Experiment not closed'});
        console.log(`Error in closing experiment: ${err}`);
    }
});

router.get('/getExperiment', async (req, res) => {
    try{
        const experiment = await getExperimentById(req.body.experimentId, req.user._id);
        if(!experiment){
            res.status(401).json({message:'Not Allowed'});
        }else{
            res.status(200).json(experiment);
        }
    }catch(err){
        res.status(500).json({message:'Experiment not found'});
        console.log(`Error in finding experiment: ${err}`);
    }
});

router.get('/getResults', async (req, res) => {
    try{
        const experiment = await Experiment.findOne({_id: ObjectId(req.body.experimentId), researcherId: ObjectId(req.user._id)});
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            const results = await findResultsByExperimentId(req.body.experimentId);
            res.status(200).send(results);
        }
    }catch(err){
        res.status(500).json({message:'Results not found'});
        console.log(`Error in finding results: ${err}`);
    }
});

router.get('/getParticipants', async (req, res) => {
    try{
        const experiment = await Experiment.findOne({_id: ObjectId(req.body.experimentId), researcherId: ObjectId(req.user._id)});
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            const participants = await findParticipantsByExperimentId(req.body.experimentId);
            res.status(200).send(participants);
        }
    }catch(err){
        res.status(500).json({message:'Participants not found'});
        console.log(`Error in finding participants: ${err}`);
    }
});

export default router;