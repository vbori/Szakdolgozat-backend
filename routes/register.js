import { Router } from 'express';
import Researcher, {findResearcherByUsername, addResearcher} from '../models/researcher.js';
import Participant, {addParticipant} from '../models/participant.js';
import Experiment, {updateExperiment, increaseParticipantNum } from '../models/experiment.js';
import { ObjectId } from 'mongodb'; 
import fs from 'fs';

const router = Router();

router.post('/researcher', async (req, res) => {
    try {
        const researcher = await findResearcherByUsername(req.body.username);
        if (researcher) {
            return res.status(400).send('Username already exists');
        }
        
        const newResearcher = new Researcher({
            username: req.body.username,
            password: req.body.password,
            activeExperimentCount: 0
        });
        await addResearcher(newResearcher);
        res.status(200).json({message:'Researcher added'});
    } catch(err) {
        if(err.name === 'ValidationError') {
            return res.status(400).json({message:'Invalid request'});
        }
        console.log(`Error in adding researcher: ${err}`);
        res.status(500).json({message:'Error during registration'});
    }
});

router.get('/participant/:experimentId', async (req, res) => {
    try {
        const experiment = await increaseParticipantNum(req.params.experimentId);
        if(!experiment) {
            return res.status(400).json({message:'Not Allowed'});
        }else if(experiment.participantNum == experiment.maxParticipantNum) {
            const update = { $set: { status: 'Closed' } };
            await updateExperiment(experiment._id, experiment.researcherId, update);
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
            return res.status(400).json({message:'Invalid request'});
        }
        console.log(`Error in participant registration: ${err}`);
        res.status(500).json({message:'Error during registration'});
    }
});

export default router;