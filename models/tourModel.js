const mongoose = require('mongoose');

// mongose schema
const tourSchema = new mongoose.Schema({
    name:{
      type : String,
      required : [true , 'A tour must have a name'], // tour name must be given and if npot then will through error 
      unique : true      // we dleceared that there must be a  unique name for all toures
    },
    duration:{
      type: Number,
      required: [true,'A tour must have a duration']
    },

  maxGroupSize: {
    type:Number,
    required:[true,'A tour must have a group size']
  },
  
  difficulty: {
    type: String,
    required: [true,'A tour must have a difficulty']
  },

    ratingsAverage :{ 
      type:Number,
      default: 4.5
    },

    ratingQuantity:{
    type: Number,
    default: 0
    },
  
    price :{
      type: Number,
      required: [true,'A tour must have a price']
    },

    priceDiscount: Number,

   summary:{
    type: String,
    trim: true,  // this scema type delet all white space befor and after a string
    required: [true,'A tour must have a description']
   }, 

   description:{
    type: String,
    trim:true,
   },

   imageCover:{
    type:String,
    required:[true,'A tour must have a cover image']
  },
  images:[String], // array of strings where strings are the location of images 

  createdAt:{
    type:Date,
    default:Date.now(),
    select: false  // so what we have done that we saved created date but we perminently hide this field from user
  },
  startDates:[Date]


  
   });
  const Tour = mongoose.model('Tour',tourSchema);
  module.exports = Tour;
   