import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
//
import { User } from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { Email } from '../utils/email.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, sendData = true) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  //
  res.cookie('jwt', token, cookieOptions);

  // Remove The Password From Output:
  user.password = undefined;
  const responseObj = {
    status: 'Success',
    token,
  };

  if (sendData) {
    responseObj.data = {
      user,
    };
  }

  res.status(statusCode).json(responseObj);
};

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;

  console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res, true);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please Provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  console.log(user);

  // password = testing1
  // user.password =$2a$12$jYm4KQW5yyYdHY4dOjlycO.4IJjMAeiDf2IR7okahIuP8tC0oYobe

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res, false);
});

const logout = catchAsync(async (req, res, next) => {
  res.cookue('jwt', 'loggedOut', {
    expires: new Date(Data.now() + 10 * 1000),
    httpOnly: true,
  });

  res.json({
    status: 'success',
  });
});

const protect = catchAsync(async (req, res, next) => {
  // 1) Getting Token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }
  // 2) Validate/Verification token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  // 3) Check if user still exists
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(
      new AppError('The User belonging to this token, no longer exists', 401),
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changesPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError('User Recently Changed password! Please log in again', 401),
    );
  }

  req.user = currentUser;
  req.locals.user = currentUser;
  // Grant access to protected route
  next();
});

// only for rendered pages frontend
const isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 3) Check if user still exists
      const currentUser = await User.findById(decodedToken.id);
      if (!currentUser) {
        return next();
      }
      // 4) Check if user changed password after the token was issued
      if (currentUser.changesPasswordAfter(decodedToken.iat)) {
        return next();
      }

      // there is a  logged in user
      req.locals.user = currentUser;
      return next();
    }
  } catch (error) {
    return next();
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // ...roles = ['admin','lead-guide'].
    if (!roles.includes(req.user.role)) {
      //!false
      // if role includes = 'user', 'guide' then err:
      return next(
        new AppError('You do not have permission to perfrom this action'),
        403,
      );
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email:
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with this email'));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // await Email({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message: message,
    // });

    // 3) Generate the random reset token

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.json({
      status: 'Success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token:
  const givenToken = req.params.token;
  const hashToken = crypto
    .createHash('sha256')
    .update(givenToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has no expired, and there is user, set the new password:
  if (!user) {
    return next(new AppError('Token is invalid or has expired'), 400);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // 3) Update changedPasswordAt property for the user:

  // 4) Log the user in, send JWT:
  createSendToken(user, 200, res, false);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection from protect middleware req.user
  const user = await User.findById(req.user._id).select('+password');

  // 2) Check if posted current password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Invalid password, Please enter right password to update'),
      401,
    );
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will not work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res, true);
});

export {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
};
