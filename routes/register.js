import { Router } from 'express';
import { registerResearcher } from '../controllers/researcher.controller.js';
import { registerParticipant } from '../controllers/participant.controller.js';

const router = Router();

router.post('/researcher', registerResearcher);
router.get('/participant/:experimentId', registerParticipant);

export default router;