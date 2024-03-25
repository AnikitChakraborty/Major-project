// this is going to be an universal file (we can use it in other project also),
//   Just chance the file path according to the project
const fs = require('fs');
const mongoose = require("mongoose");
const dotenv = require('dotenv');  
dotenv.config({path : './config.env'});

const Tour = require('./../../models/tourModel');



// FOR CONNECTING ONLINE DB 
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true   
}).then(con=>{
   // console.log(con.connections);
    console.log('Online DB connection successful! ');
});  

/*
// FOR CONNECTING LOCAL DB
mongoose.connect("mongodb://localhost:27017/natours",{ 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4 // Use IPv4, skip trying IPv6

 })
 .then(()=> console.log('DataBase successfully connected' ))
 .catch((err)=>console.log(err));
 */

 // READ JSON FILE

 // const tours = fs.readFileSync('./tours-simple.json', 'utf-8');
 /* Above code is not fully correct becoz in file 'tours-simple.json' the data is in json form. we have to convert it in js object to use it. 
    So, we well use 'JSON.parse' to convert it into js object   */

    const tours = JSON.parse( fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

    // FUNCTION TO IMPORT DATA TO DB
    const importData = async ()=>{
        try {

            await Tour.create(tours);
            console.log('Data succesfully loaded!');
            process.exit();
        } catch(err){
            console.log(err)
        }
    }

  // DELETE ALL DATA FROM DB
  const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
        process.exit();
    }catch(err){
        console.log(err);
    }
  }

  /* so, two functions are ready, but use to use them ?
    we will use precess.argv object of node .It is a globel object use to see all precesses which are being playing
                                                                                                                    */

 //  console.log(process.argv)
 //   Above line of code is to find the no. of process happening . it is js perbuild
          
    if (process.argv[2]== '--import'){
        importData();
    }
    else if (process.argv[2]=='--delete'){
        deleteData();
    }
