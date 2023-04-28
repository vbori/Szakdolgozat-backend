import { config } from 'dotenv';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import Participant, { addResponses } from '../models/participant.js';
import Result, { addResult } from '../models/result.js';
import { getExperimentById } from '../models/experiment.js';
import { findForm } from '../models/form.js';
import fs from 'fs';


config();
const router = Router();

//TODO: refactor to MVC

router.patch('/addResponses', async (req, res) => {
    try{
        const participant = await addResponses(req.body.participantId, req.body.responses);
        if(!participant) return res.status(400).json({message:'Invalid request'});
        res.status(200).json({message:'Responses added'});
    }catch(err){
        console.log(`Error in saving response: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error during saving response'});
    }
});

router.post('/saveImage', (req, res) => {
    const imageData = req.body.imageData;
    const base64Data = imageData.replace(/^data:image\/png;base64,/, ''); 
    const filePath = `./images/${req.body.experimentId}/${req.body.participantId}/round${req.body.roundIdx}.jpeg`; 

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Error saving image on server:', err);
        res.status(500).json({ error: 'Failed to save image on server' });
      } else {
        console.log('Image saved on server:', filePath);
        res.json({ message: 'Image saved on server', filePath });
      }
    });
});


router.post('/addResult', async (req, res) => {
    try{
        console.log(req.body.result)
        const participant = await Participant.findOne({_id: ObjectId(req.body.result.participantId), experimentId: ObjectId(req.body.result.experimentId)});
        if(!participant) return res.status(400).json({message:'Cannot find participant'});
        const newResult = new Result(req.body.result);
        await addResult(newResult);
        res.status(200).json({message:'Result added'});
    }catch(err){
        console.log(`Error in saving result: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error during saving result'});
    }
});

router.get('/getDescription/:experimentId/:demoMode', async (req, res) => {
    try{
        const experiment = await getExperimentById(req.params.experimentId);
        if(!experiment || (req.params.demoMode !== 'true' && experiment.status !== 'Active')){
            res.status(401).json({message:'Experiment not found'});
        }else{
            res.status(200).json(experiment.participantDescription);
        }
    }catch(err){
        console.log(`Error in finding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Experiment not found'});
    }
});

router.get('/getForm/:experimentId', async (req, res) => {
    try{
        const form = await findForm(req.params.experimentId);
        if(!form){
            res.status(401).json({message:'Form not found'});
        }else{
            const questions = form.questions;
            res.status(200).json({questions});
        }
    }catch(err){
        console.log(`Error in finding form: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Form not found'});
    }
});

router.get('/getRoundsAndTrackingInfo/:experimentId', async (req, res) => {
    try{
        const experiment = await getExperimentById(req.params.experimentId);
        if(!experiment){
            res.status(401).json({message:'Experiment not found'});
        }else{
            let {rounds, cursorImageMode, positionTrackingFrequency} = experiment;
            res.status(200).json({rounds, cursorImageMode, positionTrackingFrequency});
        }
    }catch(err){
        console.log(`Error in finding experiment: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Experiment not found'});
    }
});

router.get('/hasForm/:experimentId', async (req, res) => {
    try{
        const form = await findForm(req.params.experimentId);
        if(!form){
            res.status(200).json(false);
        }else{
            res.status(200).json(true);
        }
    }catch(err){
        console.log(`Error in searching form: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).json({message:'Invalid request'});
        }
        res.status(500).json({message:'Error during searching form'});
    }
});

export default router;