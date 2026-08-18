const mongoose=require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose").default;  //for new version of passport .default coz it give obj but in plugin we pass funcyion

const userSchema=new Schema({
    email:{
        type:String,
        required:true,
    }
    //passport local mongoose --automatically add username and password
    
});
userSchema.plugin(passportLocalMongoose);//plugin add in user schema
module.exports=mongoose.model("User",userSchema);
