import express from 'express';
import { deleteUser, test, updateUser,  getUserListings, getUser} from '../Controller/user.cont.js';
import { verifyToken } from '../utils/verifyUser.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get('/test', test);
router.put(
  '/update/:id',
  upload.single('avatar'), // 👈 multer sabse pehle
  verifyToken,
  updateUser
);

router.delete('/delete/:id', verifyToken, deleteUser)
router.get('/listings/:id', verifyToken, getUserListings)
router.get('/:id', verifyToken, getUser)

export default router;