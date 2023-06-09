const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId

module.exports={
   //add offer
   addOffer: async (body) => {
    try {
      let category = body.categoryName;
      const offerExist = await db.offer.findOne({ CategoryName: category, offerStatus: 'true' });
      console.log("offerexist", offerExist);
      if (offerExist != null) {
        return { offerExist: true };
      } else {
        const newOffer = new db.offer({
          CategoryName: body.categoryName,
          offerPercentage: body.discountPercentage,
          expirDate: body.expiry,
          offerStatus:true
        })
        await newOffer.save()
        await db.product.updateMany({category:body.categoryName},{$set:{offerPercentage: body.discountPercentage}});
        return true;
      }
    } catch (error) {
      throw error;
    }
  },
  
  //remove offer
  removeOffers:(category)=>{
    try {
      return new Promise(async(resolve, reject) => {
        await db.offer.updateOne({CategoryName:category},{$set:{offerStatus:false}});
        await db.product.updateMany({category:category},{$unset:{offerPercentage:""}})
      }) 
    } catch (error) {
      throw error;
    }
    
   
  },
  offerList: (status) => {
    try {
  
      return new Promise(async (resolve, reject) => {
        let response;
  
        if (status === 'Available') {
          response = await db.offer.find({ offerStatus: 'true' });
        } else {
          response = await db.offer.find({ offerStatus: 'false' });
        }
        resolve(response);
      });
    } catch (error) {
      // If an error occurs, reject the promise with the error
      reject(error);
    }
  },
  
}
