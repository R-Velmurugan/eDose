const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'This field is required.'
  },
  price: {
    type: String,
    required: 'This field is required.'
  },
  category: {
    type: String,
    required: 'This field is required.'
  },
  quantity: {
    type: String,
    required: 'This field is required.'
  },
  description: {
    type: String,
    required: 'This field is required.'
  },
  image: {
    type: String,
    required: 'This field is required.'
  }
});
// categorySchema.index({name:'text'})

module.exports = mongoose.model('Category', categorySchema);