import express from 'express';
import {
  getTours,
  getSingleTour,
  postTour,
  updateTour,
  deleteTour,
  // checkID,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithIn,
  getDistances,
  uploadTourImages,
  resizeTourImages,
  //
} from '../controllers/tourController.js';
//MiddleWare
import { protect, restrictTo } from '../controllers/authController.js';
import reviewsRoutes from './reviewsRoutes.js';

const tourRoutes = express.Router();

// tourRoutes.param('_id', checkID);

tourRoutes.use('/:tourId/reviews', reviewsRoutes);

tourRoutes.route('/top-5-cheap').get(aliasTopTours, getTours);
tourRoutes.route('/tour-stats').get(getTourStats);
tourRoutes
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

tourRoutes
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithIn);

tourRoutes.route('/distances/:latlng/unit/:unit').get(getDistances);

// Main Crud Routes:
tourRoutes
  .route('/')
  .get(getTours)
  .post(protect, restrictTo('admin', 'lead-guide'), postTour);

tourRoutes
  .route('/:_id')
  .get(getSingleTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// tourRoutes
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

export default tourRoutes;
