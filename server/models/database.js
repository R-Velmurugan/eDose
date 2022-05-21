const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Internet podu da loosu'));

db.once('open', function(){
  console.log('Connected')
});

// Models
require('./Category');
require('./User');


