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
        let  Percentage=0
        let discount=0
        let coupon=req.body.couponData
        let userId=req.session.users._id
       //check coupon data 
        let couponData=await couponHelper.couponValidation(coupon)
        if(couponData){
            let total = await cartHelper.grandTotal(userId)
            //find grand total 
            grandtotal = total[0].total;
        
            if(couponData.minPurchase<grandtotal){
                // console.log("coupondata",couponData)
                //  console.log("total",grandtotal);
             Percentage=couponData.discountPercentage
              discount= (grandtotal*Percentage)/100
            
       //check the coupon is used or not
       let couponExist=await couponHelper.couponExist(userId,coupon)
       console.log("couponexist",couponExist);
       if(couponExist!=null){
          res.json({AlreadyUsed:true})
          //check the coupon expiry
       }else if(couponData.expiry<new Date()){
          res.json({CouponExpired:true})
          //coupon is valid  
       }else{
          if(couponData.maxDiscountValue<discount){
              discount=couponData.maxDiscountValue
       }
       let totalAmount=(grandtotal-discount)

       console.log("total:",typeof totalAmount,totalAmount);
       res.json({couponValid:true,totalAmount:totalAmount,discount:discount})

        }
         }else{
            res.json({invalidCoupon:true})
        }
        }else{
            res.json({nocoupon:true})
        }

        
         
    }
}