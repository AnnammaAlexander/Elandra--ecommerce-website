  // const db  = require("../models/connection");
const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId

module.exports={
//aggergatioon   
viewCart:(userId)=>{
    return new Promise(async(resolve, reject) => {
        await db.cart.aggregate([
           {
            $match:{user:ObjectId(userId)}
           } ,
           {
            $unwind :"$cartItems"
           },
           {
            $project:{ item:"$cartItems.productId",
            Quantity:"$cartItems.Quantity"
           }  
           },
           {
            $lookup:{
                from:"products",
                localField:"item",
                foreignField:"_id",
                as:"carted"
            }
           },
           {
            $project:{
                item :1,
                Quantity:1,
                cartItems:{$arrayElemAt:["$carted",0]}

            }
           },

        ]).then((cartItems)=>{

            
            
            resolve(cartItems)
        })
    })
},

addToCartHelper:(userId,proId,price)=>{
    
    try {
       let proObj = {
        productId: proId,
        Quantity: 1,
        subTotal:price
            
    }
        
        return new Promise(async(resolve, reject) => {
            let carts=await db.cart.findOne({user: ObjectId(userId)});
            if(carts){
                console.log('cart exist');
                let productExist=carts.cartItems.findIndex((cartItems)=> cartItems.productId==proId);
                console.log('productExist',productExist);
                if(productExist!=-1){
                    console.log('cart update');
                   await db.cart.updateOne({
                        user:ObjectId(userId),"cartItems.productId":ObjectId(proId) },{$inc:{"cartItems.$.Quantity":1},}).then(()=>{
                            resolve();
                        })
                } else{
                    console.log('update else');
                   await db.cart.updateOne({user:ObjectId(userId)},{$push:{cartItems:proObj,}}) .then((response)=>{


                    resolve(response)
                   })
                }
                
        
        
            }else{
                let cartItems= new db.cart({user:ObjectId(userId),cartItems:proObj});
                await cartItems.save().then((response)=>{
                    resolve(response)
                })
            }
        })
        
    } catch (error) {
      console.log('cart adding error');  
    }



},
                                  
//delete product from cart
deleteProInCart: async (productId, userId) => {
  try {
    const result = await db.cart.updateOne(
      { "user": ObjectId(userId) },
      { $pull: { "cartItems": { "productId": ObjectId(productId) } } }
    );
    return result;
  } catch (error) {
    throw error;
  }
},

//update cart
postUpdateCart:async (productId, userId, subTotal,updateqty) => {
    try {

      const data = await db.cart.updateOne(
        {"user": ObjectId(userId), "cartItems.productId": ObjectId(productId)},
        {$set: {"cartItems.$.Quantity":updateqty,"cartItems.$.subTotal":subTotal}}
      );
      return data;
    } catch (error) {
      throw new Error(error);
    }
  },
  //get total amount
  grandTotal:(userId)=>{

    return new Promise(async(resolve, reject) => {
        const total=await db.cart.aggregate([
           {
            $match:{user:ObjectId(userId)}
           } ,
           {
            $unwind :"$cartItems"
           },
           { $group:{_id:ObjectId(userId),
             total:{$sum:"$cartItems.subTotal"}}},
             {
              $project:{_id:0}
             }
        
           
        ]).then((cartItems)=>{
            
            // console.log('aggregate',cartItems[0].cartItems.Image[0]);
            resolve(cartItems)
        })
    })
},


}