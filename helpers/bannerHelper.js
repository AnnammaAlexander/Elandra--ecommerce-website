const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId

module.exports={

   //admin side-banner add 
    addBanner:(data,image) =>{
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
    },
 // admin side-get banner Details
 getBanner:(page,perpage)=>{
    return new Promise((resolve, reject) => {
        try {
            db.banner.find().skip((page-1)*perpage).limit(perpage).sort({_id:-1}).then((result)=>{
                
                resolve(result)
            })
        } catch (error) {
            
        }
    })
 },
 //delete banner
 bannerDelete:(id)=>{
    return new Promise((resolve, reject) => {
        db.banner.deleteOne({_id:ObjectId(id)}).then((result)=>{
            resolve(result)
        })
    })
 },
 //user side-view banner 
 viewBanner:()=>{
    return new Promise((resolve, reject) => {
        db.banner.find().then((result)=>{
            resolve(result)
        })
    })
 }
}