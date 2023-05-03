import { config } from 'dotenv';
import { Router } from 'express';

import { addResponseToParticipant } from '../controllers/participant.controller.js';
import { saveImage, saveResult } from '../controllers/result.controller.js';
import { getDescription, getExperimentData } from '../controllers/experiment.controller.js';
import { getFormForParticipant, hasForm } from '../controllers/form.controller.js';


config();
const router = Router();

router.patch('/addResponses', addResponseToParticipant);

router.post('/saveImage', saveImage);
router.post('/addResult', saveResult);

router.get('/getDescription/:experimentId/:demoMode', getDescription);
router.get('/getRoundsAndTrackingInfo/:experimentId', getExperimentData);

router.get('/getForm/:experimentId', getFormForParticipant);
router.get('/hasForm/:experimentId', hasForm);

export default router;