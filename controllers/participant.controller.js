import Participant from '../models/Participant.js';
import { addParticipant, findParticipantsByExperimentId, addResponses } from '../services/participant.service.js';
import {updateExperiment, increaseParticipantNum, getExperimentByIdAndResearcherId } from '../services/experiment.service.js';
import { changeOpenExperimentCount } from '../services/researcher.service.js';

import { ObjectId } from 'mongodb'; 
import fs from 'fs';

export const registerParticipant = async (req, res) => {
    try {
        const experiment = await increaseParticipantNum(req.params.experimentId);
        if(!experiment) {
            console.log('Experiment not found in registerParticipant')
            return res.status(400).send('Not Allowed');
        }else if(experiment.participantNum == experiment.maxParticipantNum) {
            const update = { $set: { status: 'Closed' } };
            await updateExperiment(experiment._id, experiment.researcherId, update);
            await changeOpenExperimentCount(experiment.researcherId, -1);
        }

        const inControlGroup = Math.random() < experiment.controlGroupChance / 100.0;
        const newParticipant = new Participant({
            experimentId: ObjectId(req.params.experimentId),
            inControlGroup: inControlGroup
        });

        const participant = await addParticipant(newParticipant);
        console.log(req.params.experimentId)

        if(experiment.cursorImageMode){
            const folderName = `./images/${req.params.experimentId}/${participant._id}`;

            try {
                if (!fs.existsSync(folderName)) {
                    fs.mkdirSync(folderName);
                }
            } catch (err) {
                console.error(err);
            }
        }
        
        res.status(201).json(participant);
    } catch(err) {
        if(err.name === 'ValidationError') {
            return res.status(400).send('Invalid request');
        }
        console.log(`Error in participant registration: ${err}`);
        res.status(500).send('Error during registration');
    }
}

export const getParticipants = async (req, res) => {
    try{
      const experiment = await getExperimentByIdAndResearcherId(req.body.experimentId, req.user._id);
      if(!experiment) {
        return res.status(401).send('Not Allowed');
      }else{
        const participants = await findParticipantsByExperimentId(req.body.experimentId);
        res.status(200).send(participants);
      }
    }catch(err){
      console.log(`Error in finding participants: ${err}`);
      if(err.name === 'ValidationError' || err.name === 'TypeError') {
        return res.status(400).send('Invalid request');
      }
      res.status(500).send('Participants not found');
    }
}

export const addResponseToParticipant = async (req, res) => {
    try{
        const participant = await addResponses(req.body.participantId, req.body.responses);
        if(!participant) return res.status(400).send('Invalid request');
        res.status(200).json({message:'Responses added'});
    }catch(err){
        console.log(`Error in saving response: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error during saving response');
    }
}