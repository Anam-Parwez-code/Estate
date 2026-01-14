import express from 'express';
import { createListing } from '../Controller/listing.cont.js';
import {verifyToken} from '../utils/verifyUser.js';
import upload from '../utils/upload.js';
const router=express.Router();
router.post('/create',verifyToken,
    upload.array('images',5),
    createListing
)
    ;
export default router;