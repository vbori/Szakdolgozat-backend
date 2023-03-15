import {config} from 'dotenv';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import Participant, {addResponses} from '../models/participant.js';
import Result, {addResult} from '../models/result.js';

config();
const router = Router();

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


router.post('/addResult', async (req, res) => {
    try{
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

export default router;