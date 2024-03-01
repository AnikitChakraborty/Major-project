class APIFeatures {
    constructor(query,queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filter(){
        
    const queryobj = {...this.queryString};                     // queryobj is  a copy object of query which we are going to pass '...' is use to creat another object. refer js playlist
    const excludedFields =['page','sort','limit','fields'];  // it is very imporent . for example if we do not remove sort from quary object so we cannot make method that will work when we query sort
    excludedFields.forEach(el => delete queryobj[el]);        // using forEach method we will iterate excludedField array for every element of array we will check, is it equal to any element of queryobj , if yes then delete that element of not the itterare to next
     
    //ADVANCE FILTERING

    let  queryStr = JSON.stringify(queryobj); // we are converting queryobj to string using stringify (js method), and saving it to a string named "queryStr"
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

      this.query.find(JSON.parse(queryStr));

      return this;


    }

    sort(){

        if(this.queryString.sort){
            let sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy); // what we have done here is that when any request query comes for sorting we re-reange and make query = query.sort(then that request query)
          } else{
            this.query = this.query.sort('-createdAt');

          }
        return this;
    }

    limitFields(){
        if (this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
          } else{
            this.query = this.query.select('-__v'); // we hide this field from client by usinf - before the field name & donr by using select method
          }
        return this;
    }

    pagination(){
        const page = this.queryString.page*1 || 1; // req.page no *1 is making string to integer becoz 1 is multipied || 1 ( it is default will be page 1)
        const limit = this.queryString.limit*1 || 100; // set mage limit req *1 to make it int || default bage limit = 100 . it tell us how many result per page we will get
        const skip =(page -1 )*limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }



}

module.exports = APIFeatures;  