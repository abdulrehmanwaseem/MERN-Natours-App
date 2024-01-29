import express from 'express';
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBooking,
  getCheckOutSession,
  updateBooking,
} from './../controllers/bookingController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const bookingRoutes = express.Router();

bookingRoutes.use(protect);

bookingRoutes.get('/checkout-session/:tourId', protect, getCheckOutSession);

bookingRoutes.use(restrictTo('admin', 'lead-guide'));

bookingRoutes.route('/').get(getAllBookings).post(createBooking);

bookingRoutes
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

export default bookingRoutes;
