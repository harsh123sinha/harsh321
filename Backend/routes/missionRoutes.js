import express from 'express';
import { registerMissionInterest } from '../controllers/missionController.js';

const router = express.Router();

router.post('/register', registerMissionInterest);

export default router;
