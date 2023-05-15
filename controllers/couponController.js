const { response } = require('../app');
const helpers = require('../helpers/userHelpers')
const otpLogin = require("../OTP/otpLogin");
const user = require("../models/connection");
const couponHelper = require('../helpers/couponHelper');
const cartHelper=require('../helpers/cartHelper')
const { rmSync } = require('fs');
const { resolve } = require('path');
const session = require('express-session');
const moment=require('moment');
const { log } = require('console');
const db=require('../models/connection')

let adminStatus
module.exports = {
    //admin
    //view coupon list
    getAddCoupon:async(req,res)=>{
    //pagination 
    const page=req.query.page||1;
    const perpage=10;
    const count=await db.coupon.countDocuments({})
    const orderListCount=count
        let coupons=await couponHelper.findCoupon(page,perpage)
            res.render('admin/addCoupon',{ layout: "adminLayout", adminStatus:true, loggedIn: true, coupons,pages:Math.ceil(orderListCount/perpage) })
        
       
    },
    postCoupon:async(req,res)=>{
        await couponHelper.addCoupon(req.body)
        res.redirect('/admin/add-coupon')
    },
    //delete coupon
    deleteCoupon:async(req,res)=>{
        await couponHelper.deleteCoupon(req.query.id)
        res.json({status:true})
    },


    //user
    getCoupon:async(req,res)=>{  
        let total=parseInt(req.query.total)
        console.log("coupons...total,",req.query.total);
        let coupons= await couponHelper.couponDetails(total)

        res.json(coupons)

    },
    //applay coupon
    couponApply:async(req,res)=>{
        let coupon=req.body.couponData
        console.log("couppon:",coupon);
        let couponData=await couponHelper.couponValidation(coupon)
        console.log();
       let userId=req.session.users._id
       let total = await cartHelper.grandTotal(userId)
       grandtotal = total[0].total;
       let  Percentage=couponData.discountPercentage
       
       let discount= (grandtotal*Percentage)/100
       console.log("..........discount",discount);
       

        let couponExist=await couponHelper.couponExist(userId,coupon)
         if(couponExist!=null){
            res.json({status:false})
         }else if(couponData.expiry<new Date()){
            res.json({status:false})  
         }else{
            if(couponData.maxDiscountValue<discount){
                discount=couponData.maxDiscountValue
         }
         let totalAmount=(grandtotal-discount)

         console.log("total:",typeof totalAmount,totalAmount);
         res.json({status:true,totalAmount:totalAmount,discount:discount})
        }

        
         
    }
}