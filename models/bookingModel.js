import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema(
  {
    tyour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a Tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User!'],
    },
    Price: {
      type: Number,
      required: [true, 'Booking must Have a Price!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

bookingSchema.pre('/^find/', function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

export const Booking = mongoose.model('Booking', bookingSchema);
