const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apifeatures');

// middleware for Aliace.
 // using this middleware we are prefelling the Query for the user and 
exports.aliasTopTours = (req, res , next) => {

    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name, price,raitingAverage,summary,difficulty';
 next();
}


 


    // function for getting all tours
// we have to export all the function to tourRouter so wenn will make export object
//  to export all these functions 

exports.getAllTours = async (req,res)=>{
try{
    // Filter 

    

   // ADVENCE FILTERING

      /* Till now we saw how to code for basic quary , where we pass only "="parimeters . 
      But now we will see how to quary for "greater then", "less then", etc   */

     // let  queryStr = JSON.stringify(queryobj); // we are converting queryobj to string using stringify (js method), and saving it to a string named "queryStr"
     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); 

      /*We know in mongo for greater then and equal to, greater then , smaller then and equal to, smaller then  we use $gte, $gt,$lte,$lt resp.
      So if we get any query which equal to gte,gt, etc we will replce it with $gte, $gt, etc
      
      for that 1st we change query object to string then we use replace meethod to replace it, in repace method it calls a callback function which
       add $ infront to it*/

     //  let query =  Tour.find(JSON.parse(queryStr));  // here we again convert querystr to object . So if there is no operator then it will not replace anything.
      
      // 2) SORTING

     // if(req.query.sort){
     //   let sortBy = req.query.sort.split(',').join(' ')
     //   query = query.sort(sortBy); // what we have done here is that when any request query comes for sorting we re-reange and make query = query.sort(then that request query)
     // }

      
     // 3) FIELD LIMITING
     
     // if (req.query.fields){
    // const field = req.query.fields.split(',').join(' ');
    //  query = query.select(field);
    //  } else{
     //   query = query.select('-__v'); // we hide this field from client by usinf - before the field name & donr by using select method
     // }
     // 4) PAGINATION
     // const page = req.query.page*1 || 1; // req.page no *1 is making string to integer becoz 1 is multipied || 1 ( it is default will be page 1)
     // const limit = req.query.limit*1 || 100; // set mage limit req *1 to make it int || default bage limit = 100 . it tell us how many result per page we will get

     // const skip =(page -1 )*limit;
     // query = query.skip(skip).limit(limit);

     // if (req.query.page){
    //  const numTours = await Tour.countDocuments(); // countDocument is a express method use to count total no of document it have
    //   if(skip >= numTours) throw new Error('This page does not exist');
    //  }
     

     // 5)ALIASING 

   
        //EXECUTE QUERY
       const features = new APIFeatures(Tour.find(), req.query)
       .filter()
       .sort()
       .limitFields() 
       .pagination(); 

       const tours = await features.query;


    res.status(200).json({
        status: 'success',
        results: tours.length,
        data:{
            tours
        }
    });
}catch(err){
    res.status(404).json({
        status: 'fail',
        message: err
    })
}
 
 }; 

// function for getting any one tours

exports.getTour = async (req,res)=>{        
 try{
    const tour =await Tour.findById(req.params.id); // method to find one document
            //Tour.findOne({_id: req.param.id})

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
 }catch(err){
    res.status(404).json({
        status: 'fail',
        message: err
    })
 }         

};

// function for creating tours
 
exports.creatTour = async (req,res)=>{
    try{
const newTour = await Tour.create(req.body);
 
 res.status(201).json({
status:'success',
data: {
    tour : newTour
}
 

 });

}catch(err){
    res.status(404).json({
     message:err    
    })
    }

};

// function for updating tours

exports.updateTour = async (req,res)=>{
 try {
const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
    new: true,
    runValidators:true
});

res.status(200).json({
 status:'success',
 data: {
     tour 
 }
         
        
 });
    
 }catch(err) {
    res.status(404 ).json({
        message:err    
       })
    
 }


}
 // function for deleting tours

 exports.deleteTour =  async (req,res)=>{
try { 
    await Tour.findByIdAndDelete(req.params.id);
res.status(204).json({
    status: 'success',
    data: null
});

} catch(err){
    res.status(404).json({
        status:'fail',
        message:err
    });
};
 
};
 exports.getTourStats = async (req,res) => {
    try{
        const stats = await   Tour.aggregate([
            {
                $match:{ratingsAverage: {$gte:4.5}}
            },
            {
            $group:{
                _id: {$toUpper: '$difficulty'},
                numTours:{$sum: 1} ,
                numRating:{$sum: '$ratingsQuantity'},
                avgRating:{$avg: '$ratingsAverage'},
                avgPrice:{$avg: '$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'}
             }
            
        },
        {
            $sort : { avgPrice : 1}
        }
        ]);
        res.status(200).json({
            status:'success',
            data:{
                stats
            }
        });

    }catch(err){
        res.status(404).json({
            status : 'fail',
            message : err
        });
    }
 }
exports.getMonthlyPlan = async(req,res)=> {
    try{
     const year = req.param.year * 1;
     const plan = await Tour.aggregate([
      {
        $unwind: '$startDates' // we have toures based on date , so ex we have forest hiker 3 times (three dates ) , total 27 tours insteed of 9
      },
      {
        $match:{ // match is for select document, here we will d=select document which comes in between 1st jan of that year to 31st dec of that year
           startDates:{
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
           }
        } 
      }

     ]);
     console.log(plan);
     res.status(200).json({
        status:'success',
        data:{
            
            plan
        }
     });
    } catch(err){
      res.status(404).json({
        status:'fail',
        message:err
      });
    }
}