if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}
// console.log(process.env.SECRET);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing= require("./models/listing.js");
const Review= require("./models/review.js");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const session = require("express-session");
const {MongoStore}=require("connect-mongo");
const flash = require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");


// const {listingSchema} = require("./schema.js"); //joi validate for server side
// const {reviewSchema} = require("./schema.js");  //joi validate for server side


const listingRouter=require("./routes/listing.js"); //for express router
const reviewRouter=require("./routes/review.js");//for express router
const userRouter=require("./routes/user.js");



app.engine("ejs",ejsMate);

const dbUrl=process.env.ATLASDB_URL;
//ejs require
const path=require("path");
const { wrap } = require("module");
const { NetworkResources } = require("inspector/promises");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));

//to use req.params 
//taki sara data jo req me ara h vo parse ho paye
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));


main().then(()=>{
    console.log("connected to database");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}
//method use to create new mongo store for sessions
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600, //used so that session not update frequently like when refreshing page
});
store.on("error",()=>{
    console.log("Error in Mongo SESSION STORE",err)
});
const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expiry:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

// app.get("/",(req,res)=>{
//     res.send("Hi,I am root");
// })
app.use(session(sessionOptions));//connect.sid like cookie on our site
app.use(flash());
app.use(passport.initialize()); //passport initialize for every request
app.use(passport.session());//to identify user browse from page to page
passport.use(new localStrategy(User.authenticate()));//alluser authenticate through localstrategy and use authenticate method to authenticate the user

passport.serializeUser(User.serializeUser());//to store user info in session
passport.deserializeUser(User.deserializeUser());//to remove user info from session




app.use((req,res,next)=>{
    res.locals.success=req.flash("success"); //success array --empty initialy
    res.locals.error =req.flash("error"); 
    res.locals.currUser=req.user;
    //alert arr contain val when we add listing
    // console.log(res.locals.success);
    next();
});

app.use("/listings",listingRouter); //express router for listing routes
app.use("/listings/:id/reviews",reviewRouter); //express router for review routes
app.use("/",userRouter);

// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"my new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calanguate,Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfull testing");
// });
// app.get("/",(req,res) => {
//     console.log("hi i m home");
// });

//gives error for every req other than defined routes above 
app.use((req,res,next)=>{
    next(new ExpressError(404,"page not found"));
}); 

//error handling middleware--without this ValidationError if field like price me we pass string rather than number
//with this only small message 

app.use((err,req,res,next)=>{
    // console.log(err);
    let{status=500,message="something went wrong"}=err;
    res.status(status).render("error.ejs",{message});
    // res.status(status).send(message);
});
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});

