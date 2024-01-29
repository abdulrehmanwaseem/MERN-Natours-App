import 'dotenv/config';
import fs from 'fs';
import mongoose from 'mongoose';
import { Tour } from '../../models/tourModel.js';
import { Review } from '../../models/reviewModel.js';
import { User } from '../../models/userModel.js';

mongoose
  .connect(
    'mongodb+srv://abdulrehmancode1:natours123@cluster0.t8lmc.mongodb.net/natours',
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    },
  )
  .then(() => console.log('DB Connection Succesfull !'));

//Read Json file
const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('DATA SUCCESFULLY LOADED !');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

//Delete Json Data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data Succesfully Deleted !');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
