const mongoose=require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    image:{
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/444725757.jpg?k=2a388a66ddbef10811ab9fdf9c69eabe22be8af74b080e29b7d8e37db2c4655f&o="
        }
        // default:"https://unsplash.com/photos/people-on-beach-watch-vibrant-sunset-over-ocean-and-island-fpow9FttbUE",
        // type:String,
        // set: (v) => v==="" ? "https://unsplash.com/photos/people-on-beach-watch-vibrant-sunset-over-ocean-and-island-fpow9FttbUE":v,
        // //set me empty se compare 
        //image aari h pr empty h so default set bhi karenge
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
        type:Schema.Types.ObjectId,
        ref:"Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",  //user.js schema  refer
        },
    geometry:{ //from mongoose geojson format for point schema
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number], //array of numbers for lat,long
            required: true
        }
  },
//   category:{     // in my time--filter work acc. to category
//     type:String,
//     enum:["mountain","farms","arctic","castles","rooms","iconic cities"]
//   }
});
//handling deletion
//delete route call then this middleware execute 
listingSchema.post("findOneAndDelete",async(listing)=>{
    console.log("delete listing:",listing);
    if(listing){
        console.log("reviews to delete :",listing.reviews);
         const result=await Review.deleteMany({_id:{$in:listing.reviews}});
        console.log("deleted reviews",result);
    }
        
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;