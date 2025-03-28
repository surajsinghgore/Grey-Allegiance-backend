import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
    },
    pincode: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    status: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model
const User = mongoose.model('User', userSchema);

export default User;
