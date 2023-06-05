const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId

module.exports={
   //add offer
   addOffer: async (body) => {
    console.log("body:",body);
    try {
        let category=body.categoryName
        console.log("category",category);
      const offerExist = await db.offer.findOne({CategoryName:category,offerStatus:'true'});
      console.log("offerexist",offerExist);
      if (offerExist!=null) {
        
        return { offerExist: true };
      } else {
        const newOffer = new db.offer({
         CategoryName: body.categoryName,
          offerPercentage: body.discountPercentage,
          expirDate: body.expiry,
          offerStatus:'Active'
        });
        await newOffer.save();
        return true;
      }
    } catch (error) {
      throw error;
    }
  },
  //remove offer
  removeOffers:(id)=>{
    return new Promise(async(resolve, reject) => {
      await db.offer.updateOne({_id:ObjectId(id)},{set:{offerStatus:'disable'}})
    })
   
  }
}
