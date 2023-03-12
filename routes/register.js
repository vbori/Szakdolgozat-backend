import { Router } from 'express';
import Researcher, {findResearcherByUsername, addResearcher} from '../models/researcher.js';
import Participant, {addParticipant} from '../models/participant.js';
import Experiment, {updateExperiment} from '../models/experiment.js';
import { ObjectId } from 'mongodb'; 

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
            liveExperimentCount: 0
        });
        await addResearcher(newResearcher);
        res.status(200).json({message:'Researcher added'});
    } catch(err) {
        console.log(`Error in adding researcher: ${err}`);
        console.error(err);
        res.status(500).json({message:'Error during registration'});
    }
});

router.post('/participant', async (req, res) => {
    try {
        const experiment = await Experiment.findOne({_id: ObjectId(req.body.experimentId), status: 'Active'});
        console.log(experiment);
        if(!experiment || experiment.participantNum >= experiment.maxParticipantNum) {
            return res.status(400).json({message:'Not Allowed'});
        }

        const newParticipant = new Participant({
            experimentId: ObjectId(req.body.experimentId),
            inControlGroup: req.body.inControlGroup
        });

        const participant = await addParticipant(newParticipant);
        const update = experiment.participantNum + 1 == experiment.maxParticipantNum ? { $inc: { participantNum: 1 }, $set: { status: 'Closed' } } : { $inc: { participantNum: 1 } };
        await updateExperiment(req.body.experimentId, experiment.researcherId, update); 
        res.status(201).json({message: 'Successful authorization', participant: participant});
    } catch(err) {
        console.log(`Error in participant registration: ${err}`);
        res.status(500).json({message:'Error during registration'});
    }
});

export default router;