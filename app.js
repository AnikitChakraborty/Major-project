const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();


// 1st middle-ware
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));   
}

app.use(express.json()); // inbuild middlewere for handeling json formate
app.use(express.static(`${__dirname}/public`)); // inbuild express middlewere for display of static file like html, img etc.



// 3rd Router

app.use('/api/v1/tours',tourRouter);        
 app.use('/api/v1/users',userRouter);

  

//  henlding unwanted url
app.all('*',(req,res, next)=>{
next(new AppError(`can't find ${req.originalUrl} on this server `,404));
})
  //  error handaling middleware
  app.use(globalErrorHandler);


module.exports = app;


