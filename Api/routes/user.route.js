import express from 'express';
import { test } from '../Controller/user.cont.js';
const router= express.Router();
router.get('/test',test);
export default router;