const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: 'This field is required.'
    },
    password: {
        type: String,
        required: 'This field is required.'
    },
    cart: {
        type: Array,
        required: 'This field is required.'
    },
    history: {
        type: Array,
        required: 'This field is required.'
    },
    email:{
        type : String,
        required: 'This field is required.'
    }

});

// userSchema.index({email: 'text'})

module.exports = mongoose.model('User',userSchema)