import 'dotenv/config';
import mongoose from 'mongoose';

process.on('uncaughtException', (err) => {
  console.log('Uncaught-Exception! Shutting down...');
  console.log(err.name + ':', err.message + ': ' + err);
  process.exit(1);
});

import app from './index.js';

// console.log(app.get('env'));
// console.log(process.env);

mongoose
  .connect(
    process.env.DATABASE.replace(
      `<PASSWORD>`,
      encodeURIComponent(process.env.DATABASE_PASSWORD),
    ),
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    },
  )
  .then(() => console.log('DB Connection Succesfull !'));

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log('Server is listning on port:' + PORT);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled-Rejection! Shutting down...');
  console.log(err.name + ':', err.message + ': ' + err);
  server.close(() => {
    process.exit(1);
  });
});
