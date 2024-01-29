import express from 'express';
import {
  getUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadPhoto,
  resizeUserPhoto,
} from '../controllers/userController.js';
import {
  login,
  signup,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} from '../controllers/authController.js';

const userRoutes = express.Router();

userRoutes.post('/signup', signup);
userRoutes.post('/login', login);
userRoutes.post('/logout', logout);

userRoutes.post('/forgotPassword', forgotPassword);
userRoutes.patch('/resetPassword/:token', resetPassword);

// this will protect routes, work on the bottom one's route
userRoutes.use(protect);

userRoutes.patch('/updateMyPassword', updatePassword);
userRoutes.get('/me', getMe, getSingleUser);
userRoutes.patch('/updateMe', uploadPhoto, resizeUserPhoto, updateMe);
userRoutes.delete('/deleteMe', deleteMe);

// restrict
userRoutes.use(restrictTo('admin'));
// bottom one's get restricted to admin only
userRoutes.route('/').get(getUsers).post(createUser);
userRoutes
  .route('/:_id')
  .get(getSingleUser)
  .patch(updateUser)
  .delete(deleteUser);

export default userRoutes;
