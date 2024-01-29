import express from 'express';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  setTourAndUserId,
  updateReview,
} from '../controllers/reviewsController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const reviewsRoutes = express.Router({ mergeParams: true });

reviewsRoutes.use(protect);

reviewsRoutes
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourAndUserId, createReview);
reviewsRoutes
  .route('/:_id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

export default reviewsRoutes;
