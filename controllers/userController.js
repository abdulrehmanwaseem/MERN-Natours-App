import { User } from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';
import multer from 'multer';
import sharp from 'sharp';

// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, 'public/img/users');
//   },
//   filename: (req, file, callback) => {
//     //user-id-3242124.jpeg
//     const extention = file.minetype.split('/')[1];
//     CircleBucket(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.minetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please upload only images.', 400),
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 85 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).map((val) => {
    if (allowedFields.includes(val)) {
      newObj[val] = obj[val];
    }
  });
  return newObj;
};

const getMe = (req, res, next) => {
  req.params._id = req.user._id;
  console.log(req.params._id, '---', req.user.id);
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  // 1) Create Error if user post's password data:
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This route is not for password update's. Please use "/updateMyPassword" route`(),
        400,
      ),
    );
  }

  // 2) Filtered Out unwanted fields:
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document:
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined! Please use /signUp instead',
  });
};

const getUsers = getAll(User);
const getSingleUser = getOne(User);
const updateUser = updateOne(User);
const deleteUser = deleteOne(User);

export {
  getUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
};
