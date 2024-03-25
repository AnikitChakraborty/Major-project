const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModule');
 const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

 const signToken = id =>{
    return jwt.sign({ id },process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN // how many days a user can automatic loged in in this site.
    } );
 }
const createSendJWTToken = (user , statusCode , res)=>{

  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data:{
        user
    }
})
}

 exports.signup =catchAsync( async(req,res,next)=>{ 
    const newUser = await User.create({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
     // creating jwt token.  
    createSendJWTToken(newUser,201,res);

   
     
} );

exports.login = catchAsync( async (req,res,next)=>{
    const {email,password} = req.body // it is es6 object destructing & here oject is "body" in 'req' object.

  // chaking if email and password exist
   if(!email || !password){
    return  next(new AppError('Please provide email and password!',400));
   }
  // check if user exixt && password is correct
  const user = await User.findOne({email}).select('+password');

/* Below if  statement 1st check weather user is present or not , if present then it goes to check weather given 
password is corrct or not, if correct then create jwt token and send it in responce. If not correct then send error */
if(!user || !(await user.correctPassword(password,user.password))){
    return next(new AppError('Incorrect email or password',401))
  }
console.log(user);

 
  //if everything ok, send token to clint
  createSendJWTToken(user,200 ,res);

});

// be
exports.protect = catchAsync(async(req,res,next)=>{
// 1> Getting token and check of it's there.
let token;
if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
     token = req.headers.authorization.split(' ')[1];
}
//console.log(token);

if(!token){
return next(new AppError('You are not logged in! Please log in to get access.', 401));
}
//2> Verification tocken

/*basically jwt.verify is a function varify the entered token and JWT_SECRET, but since we need asyncronus function
so we use another promise function with it so that we can await it , for that we can simply use promisify(pre-written function) from node utils.  */
const decoded = await  promisify(jwt.verify)(token,process.env.JWT_SECRET);  
//console.log(decoded); // decoded varible store user id , token cteated date-time, tocken exp date-time
 
// 3> check if user still exists

/* There might be case where an user is created then he logged in after he deleted his account but someone get the token
that person can use that token to access the tours. To avoid this situation it is very nessery to check weather user 
still exist or not. */

const currentUser = await User.findById(decoded.id); // we after verifing token, we again search for user related to the token by user id. 
if(!currentUser){
    return next(new AppError('The user belonging to this tocken does not exist!', 401)); // if user not present then return error.
}

//4> Check if user changed password after the token was issued
if( currentUser.chancedPasswordAfter(decoded.iat)){
    return next(new AppError('User recently changed password! Please log in again', 401));
};

// GRANT ACCESS TO PROTECTED ROUTE
req.user = currentUser;
next();
});


exports.restricTo = (...roles) =>{
    // form tourRouter ['admin','lead-guid'] agrument passes. which save in varible roles
    return(req,res,next)=>{
     if(!roles.includes(req.user.role)){ // its check weather variable role have same role with req.user.role. if no then pass error if yes then simpply pass this middleware.
       return next(new AppError('You do not have permission to perform this action', 403)); 
     };   
     next();
    };
  };

  exports.forgotPassword =catchAsync(async (req,res,next) => {
   // 1> Get user based on Posted email
      const user = await User.findOne({email:req.body.email});
      if(!user){
        return next(new AppError('There is no user with this email address.',404));
      }
   //2> Generate the rendom reset token 

   const resetToken = user.createPasswordResetToken();
   await user.save({validateBeforeSave: false})

   //3> Send it to user's email
   // 1st install nodemailer package (npm i nodemailer)

  //const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;


 

try{
  await sendEmail({
    email:user.email,
    subject:'Your password reset token (valid for 10 min)',
    message  
   });
 res.status(200).json({
   status:'success',
   message: 'Tocken sent to email!'
 });

} catch(err){
  // we used try catch insteed of catchAsync becoz we not only have to send error to our globelErrorHandiling middleware but we also have to  
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

return next( new AppError ('There was an error sending the email. Try again later!', 500));
}
 });


 exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token

  //We got token from token patameter & we agin encrypt it for checking token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
    
  
  const user = await User.findOne({
    passwordResetToken: hashedToken, // finding user wich have same encrypted token
   passwordResetExpires: { $gt: Date.now() } // symentanously checking wheres tocken still valig or expited (if token created time + 10 > current time thats means token is still valid)
  });

 

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendJWTToken(user,200,res);
});

exports.updatePassword = catchAsync( async(req,res,next)=>{
  // 1> Get user from collection
  const user = await User.findById(req.user.id).select('password');


  //2> Check if posted current password is correct
if(!(user.correctPassword(req.body.passwordCurrent , user.password))){
  return next(new AppError('Your current password is wrong.', 401));
} 
  // 3> If so, update password
user.password = req.body.password;
user.passwordConfirm= req.body.passwordConfirm;
await user.save();
  //4> Log user in, send JWT Token
  createSendJWTToken(user,200,res);
});