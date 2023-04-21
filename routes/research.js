import {config} from 'dotenv';
import { Router } from 'express';
import pkg from 'bcryptjs';
import { ObjectId } from 'mongodb'; 
import fs from 'fs';

import {changeOpenExperimentCount, findResearcherById, changePassword} from '../models/researcher.js';
import Form, { addForm, findForm, editForm, deleteForm } from '../models/form.js';
import { deleteParticipants, findParticipantsByExperimentId } from '../models/participant.js';
import Experiment, {getExperimentById, getExperimentsByResearcherId, updateExperiment, addExperiment, deleteExperiment, getExperimentsByResearcherIdAndStatus} from '../models/experiment.js';
import {deleteResults, findResultsByExperimentId} from '../models/result.js';

config();
const router = Router();
const { compare } = pkg;

router.get('/', async (req, res) => {
    try{
        const experiments = await getExperimentsByResearcherIdAndStatus(req.user._id, req.query.status);
        res.status(200).json(experiments);
    }catch(err){
        console.log(`Error in finding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error in finding experiments'});
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
        console.log(`Error in changing password: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Password not changed'});
        
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
            console.log(`Form created with id: ${form._id}`);
            res.status(201).json({message: 'Form saved'});
        }
    } catch(err) {
        console.log(`Error in saving form: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error in saving form'});
    }
});

router.get('/getForm', async (req, res) => {
    try{
        const form = await findForm(req.query.experimentId);
        if(!form || form.researcherId != req.user._id) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            const questions = form.questions;
            res.status(200).json({questions});
        }
    }catch(err){
        console.log(`Error in finding form: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error in getting form'});
    }
});

router.patch('/editForm', async (req, res) => {
    try{
        const form = await editForm(req.body.experimentId, req.user._id, {questions: req.body.questions});
        if(!form) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            res.status(200).json({message:'Form edited'});
        }
    }catch(err){
        console.log(`Error in editing form: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error during editing form'});
    }
});

router.delete('/deleteForm', async (req, res) => {
    try{
        await deleteForm(req.query.experimentId, req.user._id);
        await updateExperiment(req.query.experimentId, req.user._id, { $set: { formId: null } });
        res.status(204).json({message:'Form deleted'});
    }catch(err){
        console.log(`Error in deleting form: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error during deleting form'});
    }
});

router.post('/addExperiment', async (req, res) => {
    try{
        const newExperiment = new Experiment({
            researcherId: ObjectId(req.user._id),
            name: req.body.name,
            type: "Two shapes",
            status: "Draft",
            participantNum: 0,
            maxParticipantNum: req.body.maxParticipantNum,
            controlGroupChance: req.body.controlGroupChance,
            cursorImageMode: req.body.cursorImageMode,
            positionTrackingFrequency: req.body.positionTrackingFrequency,
            researcherDescription: req.body.researcherDescription,
            participantDescription: " ",
            rounds: []
        });
        const experiment = await addExperiment(newExperiment);
        if(req.body.cursorImageMode != null){
            const folderName = `./images/${experiment._id}`;
            console.log(folderName)
            try {
                if (!fs.existsSync(folderName)) {
                    fs.mkdirSync(folderName, {recursive: true});
                }
            } catch (err) {
                console.error(err);
            }

            const tempFolderName = `./tmp/${experiment._id}`;
            console.log(folderName)
            try {
                if (!fs.existsSync(tempFolderName)) {
                    fs.mkdirSync(tempFolderName, {recursive: true});
                }
            } catch (err) {
                console.error(err);
            }
        }
        res.status(201).json(experiment);
    }catch(err){
        console.log(`Error in adding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message: 'Error during experiment creation'});
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
        console.log(`Error in deleting experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error during experiment deletion'});
    }
});

router.patch('/editExperiment', async (req, res) => {
    try{
        const experiment = await updateExperiment(req.body.experimentId, req.user._id, req.body.updatedExperiment);
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            res.status(200).json(experiment);
        }
    }catch(err){
        console.log(`Error in updating experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error during editing experiment'});
    }
});

router.patch('/openExperiment', async (req, res) => {
    try{
        const experiment = await updateExperiment(req.body.experimentId, req.user._id, { $set: { status: "Active", openedAt: Date.now } });
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            const researcher = await changeOpenExperimentCount(req.user._id, 1);
            res.status(200).json({message:'Experiment opened', experiment, activeExperimentCount: researcher.activeExperimentCount});
        }
    }catch(err){
        console.log(`Error in opening experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error - Experiment not opened'});
    }
});

router.patch('/closeExperiment', async (req, res) => {
    try{
        const experiment = await updateExperiment(req.body.experimentId, req.user._id, { $set: { status: "Closed", closedAt: Date.now } });
        if(!experiment) {
            return res.status(401).json({message:'Not Allowed'});
        }else{
            const researcher = await changeOpenExperimentCount(req.user._id, -1);
            res.status(200).json({message:'Experiment closed', experiment: experiment, researcher: researcher});
        }
    }catch(err){
        console.log(`Error in closing experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error - Experiment not closed'});
    }
});

router.get('/getExperiment/:experimentId', async (req, res) => {
    try{
        const experiment = await getExperimentById(req.params.experimentId);
        if(!experiment || experiment.researcherId.toString() !== req.user._id.toString()){
            res.status(401).json({message:'Not Allowed'});
        }else{
            res.status(200).json(experiment);
        }
    }catch(err){
        console.log(`Error in finding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Experiment not found'});
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
        console.log(`Error in finding results: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Results not found'});
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
        console.log(`Error in finding participants: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Participants not found'});
    }
});

export default router;