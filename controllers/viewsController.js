import { Booking } from '../models/bookingModel.js';
import { Tour } from '../models/tourModel.js';
import { User } from '../models/userModel.js';
import { AppError } from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const getOverview = catchAsync(async (req, res) => {
  // 1) get tour data from collection
  const tours = await Tour.find();
  // 2) build template
  // 3)Render Tour Data

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('This no tour with that name', 404));
  }
  res.render('tour', {
    title: ' | ' + tour.name.toUpperCase(),
    tour,
  });
});

const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

export const getMyTours = catchAsync(async (req, res, next) => {
  // 1) FInd All bookings
  const bookings = await Booking.find({ user: req.user._id });

  // 2) Find Tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.render('overview', {
    title: 'My Tours',
    tours,
  });
});

const updataUserData = catchAsync(async (req, res, next) => {
  try {
    console.log('Updated User', req.body);
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser,
    });
  } catch (error) {}
});

export { getOverview, getTour, getLoginForm, getAccount, updataUserData };
