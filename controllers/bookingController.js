import { Tour } from '../models/tourModel.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import stripe from 'stripe';
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
import { Booking } from '../models/bookingModel.js';

export const getCheckOutSession = catchAsync(async (req, res, next) => {
  // 1) Get The currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tours=${req.params.tourId}&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: `${tour.summary}`,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'pkr',
        quantity: 1,
      },
    ],
  });
  // 3) Create session as response

  res.json({
    status: 'success',
    session,
  });
});

export const createBookingCheckOut = catchAsync(async (req, res, next) => {
  // This is only temporary, because ut's unsecure: everyone can make bookings without paying by hiting this url
  const { tour, user, price } = req.query;

  if (!tour & !user & !price) {
    next();
  }
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

export const createBooking = createOne(Booking);
export const getBooking = getOne(Booking);
export const getAllBookings = getAll(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
