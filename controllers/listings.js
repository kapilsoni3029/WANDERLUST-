
const Listing= require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});

};
module.exports.renderNewForm=(req,res)=>{
    // console.log(req.user);
    res.render("listings/new.ejs");
}
module.exports.showListing=async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author",},}).populate("owner");
    //populate --review and owner ki info related to listing come from database when listing come from db
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    // console.log(listing.image.url);
    // console.log(JSON.stringify(listing,null,2));
    console.log(listing);
    // console.log("LISTING FROM DATABASE:"); ---testing if coordinates reach here from show.js
    // console.log(listing.geometry);
    res.render("listings/show.ejs",{listing});
};
module.exports.createListing=async(req,res)=>{
    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 2
    })
  .send()
    console.log(response.body.features[0].geometry);

  
    let url=req.file.path; //extracting path and filename from req.file then newListing.image me set kr denge
    let filename=req.file.filename;
    // console.log(url,"..",filename);
    
    // let {title,description,image,price,location,country}=req.body;
    const newListing= new Listing(req.body.listing);
    newListing.owner=req.user._id;//for new listing who created its owner will be himself
    newListing.image={url,filename};  //set the url and filename
    newListing.geometry=response.body.features[0].geometry; //val. from mapbox storing in newListing
    // console.log("GEOMETRY BEFORE SAVE:"); ----for testing
    // console.log(newListing.geometry);
    let savedListing=await newListing.save(); //now newlisting save with its coordinates
    console.log(savedListing); //can see geometry--type and coordinates
    // console.log("GEOMETRY AFTER SAVE:");----for testing -check  coordinates after save
    // console.log(savedListing.geometry);
    req.flash("success","New Listing Created");
    res.redirect("/listings");
};
module.exports.renderEditForm=async(req,res)=>{
    let{id}=req.params; //parameter se id nikali
    const listing=await Listing.findById(id);//listing ko find kiya
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    };
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};
module.exports.updateListing=async(req,res)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400,"send valid data for listing");
    // }
    let{id}=req.params; //or let id=req.parmas.id

    let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
    //the req.body.listing which is obj of js contain all parameters
    //deconstruct krke unn parameter ko individual values me convert krenge 
    //jisko hum new updated val me passs kr denge
    if(typeof req.file!="undefined"){
        let url=req.file.path; //extracting path and filename from req.file then newListing.image me set kr denge
        let filename=req.file.filename;
        listing.image={url,filename};
        listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`); //---show route pr redirect
};
module.exports.destroyListing=async (req,res)=>{
    let{id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}