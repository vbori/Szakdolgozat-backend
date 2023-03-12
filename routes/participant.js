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
        if(!participant) return res.status(400).json({message:'Cannot find participant'});
        res.status(200).json({message:'Responses added'});
    }catch(err){
        res.status(500).json({message:'Responses not added'});
        console.log(`Error in saving response: ${err}`);
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
        res.status(500).json({message:'Result not added'});
        console.log(`Error in saving result: ${err}`);
    }
});

export default router;