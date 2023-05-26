const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId

module.exports={
    addToWishlist:(proId,userId,price)=>{
        let wishObj = {
            productId: proId,
            Price: price,
            Quantity: 1
           }
           
        return new Promise(async(resolve, reject) => {
            try {
                let Userwishlist=await db.wishList.findOne({ user:ObjectId(userId)});
    
                if(Userwishlist==null){
                    const wishItems= new db.wishList({user:ObjectId(userId),wishList:wishObj});
                    await wishItems.save().then((data)=>{
                        console.log("dddddata:",data);
                        resolve({wishlistAdded: true})
                       })
                }else{
                    let wishItem=await db.wishList.findOne({user:ObjectId(userId),"wishList.productId":ObjectId(proId)});
                    if(!wishItem){
                        
                        await db.wishList.updateOne({user:ObjectId(userId)},{$push:{wishList:wishObj,}});
                        resolve({wishlistAdded: true})
                    }else{
        
                        resolve({wishlistAdded: true})
                    }
                    
                }

              } catch (error) {
                // Block of code to handle the error
              }
              
              
               
        })


    },
    wishlist:async(userId)=>{
        let data =  await db.wishList.aggregate([
          {$match:{
              user:ObjectId(userId)
          } 
      },
          
          {$unwind:{
              path:"$wishList",includeArrayIndex:"string"
          }
      },
          {$lookup:{
              from: "products",
              localField: "wishList.productId",
              foreignField: "_id",
              as: "proDetails",
          }
      },
      {$unwind:{
              path:"$proDetails",
              includeArrayIndex:"string"
          }
      },
      {
         $project:{
      
          _id:0,
          Productname:'$proDetails.Productname',
          _id:'$proDetails._id',
          ProductDescription:'$proDetails.ProductDescription',
          Quantity:'$proDetails.Quantity',
          Image:'$proDetails.Image',
          Price:'$proDetails.Price',
          category:'$proDetails.category'
          
      
        } 
      }
      
       ])
        return data
      },

      wishlistcount:async(userid)=>{
        try {
          const wishCount = await db.wishList.findOne({user:userid});
          if (wishCount) {
            return wishCount.wishList.length;
          } else {
            return 0;
          }
        } catch (error) {
          throw error;
        }
      },

      deleteWishlistItem:async(proid,userId) => {
        try {
          const result = await db.wishList.updateOne(
            { "user": ObjectId(userId) },
            { $pull: { "wishList": { "productId":ObjectId(proid) } } }
          );
          return result;
        } catch (error) {
          throw error;
        }
      },
      //add to cart from wishlist
                                              
 
}