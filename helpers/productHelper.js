const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId

module.exports={
  
    getProduct: () => {
        return new Promise(async (resolve, reject) => {
          try {
            // Retrieve products with offer details using aggregation
            const response = await db.product.aggregate([
              {
                $lookup: {
                    from:"offers",
                    localField:"category",
                    foreignField:"CategoryName",
                    as:"offerDetails"
                }
              }
            ]).exec();
            resolve(response);
          } catch (error) {
            console.error(error);
            reject(error);
          }
        });
      
    },
    //Featured-products 
    getFeatured: () => {
        try {
          // Retrieve featured products
          return new Promise(async (resolve, reject) => {
            await db.product.find().skip(5).limit(8).then((response) => {
              resolve(response);
            });
          });
        } catch (error) {
          // Handle any errors that occur
          console.error(error);
          throw error;
        }
      },
    //popular
    getPopular: () => {
        try {
          // Retrieve popular products
          return new Promise(async (resolve, reject) => {
            await db.product.find().sort('-1').limit(8).then((response) => {
              resolve(response);
            });
          });
        } catch (error) {
          // Handle any errors that occur
          console.error(error);
          throw error;
        }
      }
      
}