const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId
const moment=require('moment')
module.exports = {
//admin
    findCoupon:(page,perpage)=>{
        return new Promise(async(resolve, reject) => {
        await db.coupon.find().skip((page-1)*perpage).limit(perpage).sort({_id:-1}).then((result)=>{
            result.expiry=moment(result.expiry).format("Do MMM YYYY")
                resolve(result)
            })
        })
    },
    addCoupon:(data)=>{
        return new Promise(async(resolve, reject) => {
           let couponExist =db.coupon({
            couponName:data.couponName,
            minPurchase:data.minimumPurchase,
            discountPercentage:data.discountPercentage,
            maxDiscountValue:data.maxDiscountValue,
            expiry:data.expiry,
            description:data.description,
            code:data.keywords
           })
           await couponExist.save().then((result)=>{
            console.log(".........",result);
            resolve(result)
           })
        })
    },
    deleteCoupon:(couponId)=>{
        return new Promise(async(resolve, reject) => {
            await db.coupon.deleteOne({ _id:ObjectId(couponId)}).then((response)=>{
                resolve(response)

            })
        })
    },


    //user
    couponDetails:(total)=>{
        return new Promise(async(resolve, reject) => {
            await db.coupon.find({minPurchase:{$lte:total}}).then((response)=>{
            
                resolve(response)

            })
        })
    },
    couponValidation:(couponCode)=>{
        return new Promise(async(resolve, reject) => {
            await db.coupon.findOne({code:couponCode}).then((response)=>{
                 resolve(response)
            })
        })
    },
    couponExist:(userId,coupon)=>{
        return new Promise(async(resolve, reject) => {
        await db.user.findOne({_id:ObjectId(userId),coupons:{$in:[coupon]}}).then((response)=>{
            resolve(response)
        })
        
        })
    }
    
}



