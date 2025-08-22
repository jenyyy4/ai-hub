import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getCreations, getPublishedCreations, toggleLikeCreation } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/get-user-creations', auth, getCreations);
userRouter.get('/get-publised-creations', auth, getPublishedCreations);
userRouter.post('/toggle-like-creation', auth, toggleLikeCreation);

export default userRouter;