const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId

module.exports={

   //admin side-banner add 
    addBanner:(data,image) =>{
        try {
            return new Promise(async(resolve, reject) => {
                let banners=db.banner({
                    subHeading:data.subHeading,
                    mainHeading:data.mainHeading,
                    content:data.content,
                    tagLine1:data.tag1,
                    tagLine2:data.tag2,
                    Image:image
                  
                })
                await banners.save().then((result)=>{
                    resolve(result)
                })
            }) 
        } catch (error) {
            throw error;
        }
       
    },
 // admin side-get banner Details
 getBanner: (page, perpage) => {
    return new Promise((resolve, reject) => {
      try {
        db.banner.find()
          .skip((page - 1) * perpage)
          .limit(perpage)
          .sort({ _id: -1 })
          .exec((error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  
 //delete banner
 bannerDelete: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db.banner.deleteOne({ _id: ObjectId(id) }).exec();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
 //user side-view banner 
 viewBanner: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db.banner.find().exec();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  
 
}