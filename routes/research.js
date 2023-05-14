import {config} from 'dotenv';
import { Router } from 'express';

import { changePassword } from '../controllers/researcher.controller.js';
import { createForm, getForm, editForm, removeForm } from '../controllers/form.controller.js';
import { listExperiments, createExperiment, deleteExperimentData,editExperiment, openExperiment, closeExperiment, getExperiment } from '../controllers/experiment.controller.js';
import { downloadResults } from '../controllers/result.controller.js';

config();
const router = Router(); 

router.patch('/changePassword', changePassword);

router.post('/addForm', createForm);
router.get('/getForm', getForm);
router.patch('/editForm', editForm);
router.delete('/deleteForm', removeForm);

router.get('/', listExperiments);
router.post('/addExperiment', createExperiment);
router.delete('/deleteExperiment/:experimentId', deleteExperimentData);
router.patch('/editExperiment', editExperiment);
router.patch('/openExperiment', openExperiment);
router.patch('/closeExperiment', closeExperiment);
router.get('/getExperiment/:experimentId', getExperiment);

router.get('/downloadResults/:experimentId/:format', downloadResults);

export default router;