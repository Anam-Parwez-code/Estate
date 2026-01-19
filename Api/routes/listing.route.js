import express from 'express';
import { createListing,deleteListing,updateListing,getListing } from '../Controller/listing.cont.js';
import {verifyToken} from '../utils/verifyUser.js';
import upload from '../utils/upload.js';
const router=express.Router();
router.post('/create',verifyToken,
    upload.array('images',5),
    createListing
);
router.delete('/delete/:id',verifyToken,deleteListing);
router.post('/update/:id',verifyToken,updateListing);
router.get('/get/:id',getListing);
export default router;