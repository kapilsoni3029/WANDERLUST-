const listing=require("./models/listing");
const Review=require("./models/review");
const Listing = require("./models/listing");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js"); //joi validate for server side
module.exports.isLoggedIn=(req,res,next)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        //redirectUrl saVE here--create new parameter in req.session
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must logged in to Create Listing!");
        return res.redirect("/login");
    }
    next();
};

//need to save req.session.redirectUrl coz after loggin session will be reset
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};
//middleware for authorization of listing-edit ,update,delete
module.exports.isOwner=async(req,res,next)=>{
    let{id}=req.params; //or let id=req.parmas.id
    let listing=await Listing.findById(id);
    if(!listing.owner.equals (res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing.");//authorization for listing update
        res.redirect(`/listings/${id}`);
    }
    next();
}
//validate listing
//middleware fn of joy tool to validate listing for server side validation
module.exports.validateListing=(req,res,next)=>{
    //joy-individual fields par validation apply
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}
//validate reviews
//middleware fn of joy tool to validate reviews for server side validation
module.exports.validateReview=(req,res,next)=>{
    //joy-validation apply on individual fields
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor=async(req,res,next)=>{
    let{id,reviewId}=req.params; //or let id=req.parmas.id
    let review=await Review.findById(reviewId);
    if(!review.author.equals (res.locals.currUser._id)){
        req.flash("error","You are not the author of this review.");//authorization for listing update
        res.redirect(`/listings/${id}`);
    }
    next();
}