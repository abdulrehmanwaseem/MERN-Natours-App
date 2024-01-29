import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'Please provide a valid email'],
  },
  name: {
    type: String,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    maxlength: 40,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'Passwords are not same, Please check the password confirm field again',
    ],
    validate: {
      // This only works on .Create and .Save!!!
      validator: function (element) {
        return element === this.password; // abc === abc
      },
      message: 'Passwords Are Not The Same!',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only runs this func if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // Only runs this func if password was actually modified
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 2000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // This points to current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword, // marked to recent give non-hash-password
  userPassword, // marked to already hash-password
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changesPasswordAfter = function (JWTTimeStamps) {
  if (this.passwordChangeAt) {
    const changedTimesStamp = Math.floor(
      this.passwordChangeAt.getTime() / 1000,
    );
    console.log(JWTTimeStamps, changedTimesStamp);
    // True means changed
    return JWTTimeStamps < changedTimesStamp;
  }

  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model('User', userSchema);
