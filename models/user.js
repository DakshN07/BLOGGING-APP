const { Timestamp } = require('bson');
const { createHmac, randomBytes } = require('crypto');
const {Schema, model} = require('mongoose');
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema({
    fullName:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required: true,
    },
    profileImageURL:{
        type:String,
        default:"/images/UserAvatar.png",
    },
    role:{
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
},
{timestamps : true}
);

userSchema.pre('save', function(next){
    const user = this;

    console.log("Before saving user:", user);

    if(!user.isModified("password")) return next();

    if (!user.password) {
        return next(new Error("Password is required"));
    }

    const salt = randomBytes(16).toString('hex');
    console.log("Generated Salt:", salt);

    console.log("User  Password before hashing:", user.password); 

    try {
        // Hash the password with the salt
        const hashedPassword = createHmac("sha256", salt)
            .update(user.password)
            .digest("hex");

        // Store the salt and hashed password
        this.salt = salt;
        this.password = hashedPassword;

        console.log("Hashed Password:", hashedPassword); // Log the hashed password
        next(); // Proceed to save the user
    } catch (error) {
        return next(error); // Pass any errors to the next middleware
    }
});

userSchema.static("matchPasswordAndGenerateToken", async function(email, password){
    const user = await this.findOne({ email });
    if(!user) throw new Error ("User Not Found");

    const salt = user.salt;
    console.log("Salt:", salt);

    const hashedPassword = user.password;
    if (!salt) throw new Error("User  salt is not defined");

    console.log("Password:", password);
    const userProvidedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

    if(userProvidedHash !== hashedPassword) throw new Error ("Incorrect Passsword");

    const token = createTokenForUser(user)
    return token;
});

const User = model('user', userSchema);

module.exports = User;