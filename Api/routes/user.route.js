import express from 'express';
import { test, updateUser} from '../Controller/user.cont.js';
import {verifyToken} from '../utils/verifyUser.js';
import { deleteUser } from 'firebase/auth';
const router= express.Router();
router.get("/test",test);
router.put('/update/:id',verifyToken,updateUser)
router.delete('/delete/:id',verifyToken,deleteUser)
export default router;