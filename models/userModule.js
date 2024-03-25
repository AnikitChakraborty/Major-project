const crypto = require('crypto');
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
    role:{
     type:String,
     enum:['user','guide','lead-guid','admin'],
     default:'user'
    },
    password:{
        type: String,
        require:[true,'Please provide a password'],
        minLendth:8,
        select: false // password will not show in any output. Although it will be in database.
    },
    passwordConfirm:{
        type: String,
        required: [true,'Please confirm your password'],
        //writing custom validator by using validate property to validate password and passwordConfirm
        validate: {
           validator: function(el){ // a call back function
            return el === this.password;
           },
           message: "Passord are not same!"
        }
    },
    passwordChangedAt:{
      type:  Date   
    },  // this pass..At: type-->Date , it saves date at which password is changed.
    
    passwordResetToken: String,
    passwordResetExpire:Date,

    active:{
      type:Boolean,   // type of active field will be boolean
      default:true,  // default true means every user will be active by default 
      select:false    // active field will not shown
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

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  

  // this middleware will run befour any quarys which strt with find{ex: findandUpdate,findbyId,etc} [/^find/ it is a js regular expression ]
userSchema.pre(/^find/, function(next){
  // this point to current query
  this.find({active: {$ne:false}});
  next();
});


/*function/Instance methods(correctPassword) will take 2 argument candidatePassword(given by person during login) & userPassword then it 1st 
encrypt the password and then compaire both, If they matches then return true/false 
 */
userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.chancedPasswordAfter = function(JWTTimestamp ){
if(this.passwordChangedAt){
 const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10); // learn about parsInt
   // console.log(changedTimestamp, JWTTimestamp );
    return JWTTimestamp  < changedTimestamp;
}  
 return false; // In default we it returns false that show that password is not chanced after creating tocken 
};
/*
userSchema.methods.createPasswordResetToken = function(){
// password reset token should be a random string but need not to be as cryptographically strong. so we use build in node crypto module
const resetToken =crypto.randomBytes(32).toString('hex');
this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');  // Encrapting the resetToken to store it in database
console.log({resetToken},  this.passwordResetToken),
this.passwordResetExpire = Date.now() + 10*60*1000;
return resetToken;
}
*/
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
      console.log('**********'+ this.passwordResetExpires)
    return resetToken;
  };

const User = mongoose.model('User',userSchema);
module.exports = User;
 