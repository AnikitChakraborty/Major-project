const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// name , email , photo,password,passwordConfirm

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,'Please tell us your name!']

    },
    email:{
        type: String,
        required:[true,'Please provide your email'],
        unique:[true,'this email aldrady has accout'],
        lowercase:true,
        validate: [validator.isEmail,'Please provide a valid email']
    }, 
    photo: String,
    password:{
        type: String,
        require:[true,'Please provide a password'],
        minLendth:8
    },
    passwordConfirm:{
        type: String,
        required: [true,'Please confirm your password'],
        //writing custom validator by using validate property to validate password and passwordConfirm
        validate: {
           validator: function(el){ // a call back function
            return el === this.password;
           },
           message: "Passord are not same"
        }
    }

}) ;
userSchema.pre('save', async function(next){
    if(!this.isModified('password'))return next();
   this.password = await bcrypt.hash(this.password,12);

   this.passwordConfirm = undefined;
   next();

   /* steps:-
   1> make pre save middleware 
   1> check that is password is modifided/create . if not modified then next(skip this middleware). else run the middleware.
   3> take password use bcryptjs to add additional string to the passwod
   4> at last we dont need the conferm password to save in database , so we make it undefine  */
});

const User = mongoose.model('User',userSchema);
module.exports = User;
 