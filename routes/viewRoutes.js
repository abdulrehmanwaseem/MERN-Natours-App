import express from 'express';
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updataUserData,
  getMyTours,
} from '../controllers/viewsController.js';
import { isLoggedIn, protect } from '../controllers/authController.js';
import { createBookingCheckOut } from '../controllers/bookingController.js';
// import { isLoggedIn } from '../controllers/authController.js';

export const viewRouter = express.Router();

// viewRouter.use(isLoggedIn);

// viewRouter.route('/').get(isLoggedIn, getOverview);
// viewRouter.route('/tour/:slug').get(isLoggedIn, getTour);
// viewRouter.route('/login').get(isLoggedIn, getLoginForm);
// viewRouter.route('/me').get(getAccount);

viewRouter.route('/').get(createBookingCheckOut, isLoggedIn, getOverview);
viewRouter.route('/tour/:slug').get(getTour);
viewRouter.route('/login').get(getLoginForm);
viewRouter.route('/me').get(protect, getAccount);
viewRouter.route('/my-tours').get(protect, getMyTours);

viewRouter.route('/submit-user-data').get(protect, updataUserData);
