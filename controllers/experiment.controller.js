import Experiment from '../models/Experiment.js';
import { getExperimentById, updateExperiment, addExperiment, deleteExperiment, getExperimentsByResearcherIdAndStatus, getExperimentByIdAndResearcherId } from '../services/experiment.service.js';
import { deleteResults } from '../services/result.service.js';
import { deleteParticipants } from '../services/participant.service.js';
import { changeOpenExperimentCount } from '../services/researcher.service.js';
import { deleteForm } from '../services/form.service.js';

import { ObjectId } from 'mongodb';
import fs from 'fs';

export const listExperiments = async (req, res) => {
    try{
        const experiments = await getExperimentsByResearcherIdAndStatus(req.user._id, req.query.status);
        res.status(200).json(experiments);
    }catch(err){
        console.log(`Error in finding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error in finding experiments');
    }
}

export const createExperiment = async (req, res) => {
    try{
        const newExperiment = new Experiment({
            researcherId: ObjectId(req.user._id),
            name: req.body.name,
            status: "Draft",
            participantNum: 0,
            maxParticipantNum: req.body.maxParticipantNum,
            controlGroupChance: req.body.controlGroupChance,
            cursorImageMode: req.body.cursorImageMode,
            positionTrackingFrequency: req.body.positionTrackingFrequency,
            researcherDescription: req.body.researcherDescription,
            participantDescription: "Welcome to the experiment!",
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
        }
        res.status(201).json(experiment);
    }catch(err){
        console.log(`Error in adding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error during experiment creation');
    }
}

export const deleteExperimentData = async (req, res) => {
    try{
        const experiment = await getExperimentByIdAndResearcherId(req.params.experimentId, req.user._id);
        if(!experiment) {
            return res.status(401).send('Not Allowed');
        }else{
            await deleteParticipants(req.params.experimentId);
            await deleteForm(req.params.experimentId);
            await deleteResults(req.params.experimentId);
            await deleteExperiment(req.params.experimentId);
            if(experiment.cursorImageMode != null){
                const folder = `./images/${experiment._id}`;
                fs.rm(folder, { recursive: true }, (err) => {
                    if(err) console.log("Error in deleting folder");
                });
                console.log(`${folder} is deleted!`);
            }
            res.status(200).json({message:'Experiment deleted'});
        }
    }catch(err){
        console.log(`Error in deleting experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error during experiment deletion');
    }
}

export const editExperiment = async (req, res) => {
    try{
        const experiment = await updateExperiment(req.body.experimentId, req.user._id, req.body.updatedExperiment);
        if(!experiment) {
            return res.status(401).send('Not Allowed');
        }else{
            res.status(200).json(experiment);
        }
    }catch(err){
        console.log(`Error in updating experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error during editing experiment');
    }
}

export const openExperiment = async (req, res) => {
    try{
        const experiment = await getExperimentById(req.body.experimentId);
        if(!experiment || experiment.researcherId != req.user._id) {
            return res.status(401).send('Not Allowed');
        }else{
            const researcher = await changeOpenExperimentCount(req.user._id, 1);
            if(!researcher) {
                return res.status(401).send('You have reached the maximum number of open experiments');
            }else{
                const updatedExperiment = await updateExperiment(req.body.experimentId, req.user._id, { $set: { status: "Active", openedAt: Date.now() } });
                if(!updatedExperiment) {
                    return res.status(401).send('Not Allowed');
                }else{
                    res.status(200).json({message:'Experiment opened', experiment: updatedExperiment, activeExperimentCount: researcher.activeExperimentCount});
                }
            }
        }
    }catch(err){
        console.log(`Error in opening experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error - Experiment not opened');
    }
}

export const closeExperiment = async (req, res) => {
    try{
        const experiment = await updateExperiment(req.body.experimentId, req.user._id, { $set: { status: "Closed", closedAt: Date.now() } });
        if(!experiment) {
            return res.status(401).send('Not Allowed');
        }else{
            const researcher = await changeOpenExperimentCount(req.user._id, -1);
            res.status(200).json({message:'Experiment closed', experiment: experiment, researcher: researcher});
        }
    }catch(err){
        console.log(`Error in closing experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error - Experiment not closed');
    }
}

export const getExperiment =  async (req, res) => {
    try{
        const experiment = await getExperimentById(req.params.experimentId);
        if(!experiment || experiment.researcherId.toString() !== req.user._id.toString()){
            res.status(401).send('Not Allowed');
        }else{
            res.status(200).json(experiment);
        }
    }catch(err){
        console.log(`Error in finding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Experiment not found');
    }
}

export const getDescription = async (req, res) => {
    try{
        const experiment = await getExperimentById(req.params.experimentId);
        if(!experiment ){
            res.status(401).send('Experiment not found');
        }else{
            res.status(200).json(experiment.participantDescription);
        }
    }catch(err){
        console.log(`Error in finding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Internal server error');
    }
}

export const getExperimentData = async (req, res) => {
    try{
        const experiment = await getExperimentById(req.params.experimentId);
        if(!experiment){
            res.status(401).send('Experiment not found');
        }else{
            let {rounds, cursorImageMode, positionTrackingFrequency} = experiment;
            res.status(200).json({rounds, cursorImageMode, positionTrackingFrequency});
        }
    }catch(err){
        console.log(`Error in finding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Internal server error');
    }
}