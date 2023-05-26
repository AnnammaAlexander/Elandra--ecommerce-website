const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId

module.exports={
   //add offer
   addOffer: async (body) => {
    try {
        let category=body.categoryName
        console.log("/////////////////////////////////////////",category);
      const offerExist = await db.offer.findOne({ categoryName:category , offerStatus: 'true' });
      if (offerExist) {
        console.log("offer existtttttttttttttttttttttttttttttttttt");
        return { offerExist: true };
      } else {
        const newOffer = new db.offer({
         CategoryName: body.categoryName,
          offerPercentage: body.discountPercentage,
          expirDate: body.expiry,
          offerStatus: 'true'
        });
        await newOffer.save();
        return true;
      }
    } catch (error) {
      throw error;
    }
  },
}
