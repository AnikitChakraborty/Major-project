const dotenv = require('dotenv');  // npm i --save dotenv <-------- use this before 
dotenv.config({path : './config.env'})
const mongoose = require("mongoose");

const app=require('./app');
//console.log(process.env);
if (process.env.NODE_ENV ==='production') {
    console.log('hi clint **********');
}

mongoose.connect("mongodb://localhost:27017/natours",{ 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4 // Use IPv4, skip trying IPv6

 })
 .then(()=> console.log('DataBase successfully connected' ))
 .catch((err)=>console.log(err));
  
  
 

const port = process.env.PORT || 3001;  
app.listen(port,()=>{
console.log(`App is running on port ${port}..`);

}) 