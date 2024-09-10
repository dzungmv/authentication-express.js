
const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        index: true,
        unique: true,
        trim: true,
    },
    password:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    verify: {
        type: Schema.Types.Boolean,
        default: false
    },
    roles: {
        type: Array,
        default: []
    }
}, {
    timestamps: true,
    collection: 'Users'
});

module.exports = model('User', userSchema);