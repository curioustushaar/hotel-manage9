const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test')
  .then(() => {
    console.log('SUCCESS: Local MongoDB is running');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILURE: Local MongoDB is not running', err.message);
    process.exit(1);
  });
