const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId
const moment=require('moment')
module.exports = {
//admin
findCoupon: (page, perpage) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Find coupons with pagination, sorting, and date formatting
        const result = await db.coupon.find()
          .skip((page - 1) * perpage)
          .limit(perpage)
          .sort({ _id: -1 })
          .exec();
  
        // Format the expiry date of each coupon using moment.js
        result.forEach((coupon) => {
          coupon.expiry = moment(coupon.expiry).format("Do MMM YYYY");
        });
  
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  addCoupon: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const couponExist = new db.coupon({
          couponName: data.couponName,
          minPurchase: data.minimumPurchase,
          discountPercentage: data.discountPercentage,
          maxDiscountValue: data.maxDiscountValue,
          expiry: data.expiry,
          description: data.description,
          code: data.keywords
        });
  
        const result = await couponExist.save();
  
        resolve(result);
      } catch (error) {
        reject(error);
      }
        });
    },
    deleteCoupon: (couponId) => {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await db.coupon.deleteOne({ _id: ObjectId(couponId) });
      
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      },


    
      couponDetails: (total) => {
        return new Promise(async (resolve, reject) => {
          try {
            // Find coupons where minPurchase is less than or equal to the provided total
            const response = await db.coupon.find({ minPurchase: { $lte: total } });
      
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      }
      ,
      couponValidation: (couponCode) => {
        return new Promise(async (resolve, reject) => {
          try {
            // Find a coupon with the provided couponCode
            const response = await db.coupon.findOne({ code: couponCode });
      
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      },
      
      couponExist: (userId, coupon) => {
        return new Promise(async (resolve, reject) => {
          try {
            // Find a user with the provided userId and check if the coupons array contains the specified coupon
            const response = await db.user.findOne({ _id: ObjectId(userId), coupons: { $in: [coupon] } });
      
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      },
      
}



