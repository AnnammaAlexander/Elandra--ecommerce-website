const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId

module.exports={
    getProduct:()=>{
        try {
            return new Promise(async(resolve, reject) => {
                await db.product.find().limit(8).then((response)=>{
                    console.log("products:",response);
                    resolve(response)

                })
            })
            
        } catch (error) {
            
        }
    },
    //Featured-products 
    getFeatured:()=>{
        try {
            return new Promise(async(resolve, reject) => {
                await db.product.find().skip(5).limit(8).then((response)=>{
                    resolve(response)
                })
                
            })
        } catch (error) {
            
        }
    },
    //popular
    getPopular:()=>{
        try {
            return new Promise(async(resolve, reject) => {
                await db.product.find().sort('-1').limit(8).then((response)=>{
                    console.log("products:",response);
                    resolve(response)

                })
            })
            
        } catch (error) {
            
        }
    }
    
}