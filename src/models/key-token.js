const mongoose = require('mongoose'); 

var keyTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: 'User'
    },
    publicKey: {
        type: String,
        require: true
    },
    privateKey: {
        type: String,
        require: true
    },
    refreshToken: {
        type: Array,
        default: []
    }
}, {
    timestamps: true,
    collection: 'Keys'
});

//Export the model
module.exports = mongoose.model('Key', keyTokenSchema);