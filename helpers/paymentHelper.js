const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId
const moment=require('moment')
module.exports = {
    //update wallet amount
    getTotalPrice:(orderid)=>{
//         return new Promise(async(resolve, reject) => {
//             await db.order.findOne({id:ObjectId(orderid)})
//         }).then((response)=>{
            
// console.log("dddddddddddddddddddddddddddddd",response);
//             resolve(response)

//         })
             return new Promise(async(resolve, reject) => {
                await db.order.aggregate([
                    {
                        $match:{_id:ObjectId(orderid)}
                    },
                    {
                        $project:{  
                            totalPrice:1,
                             _id:0}
                    }
        
                ]).then((totalAmt)=>{
                    console.log("total price",totalAmt);
                    
                    resolve(totalAmt)
                })
            })
       
        
        

    },
    //refund to wallet
    refundToWallet:async(price, userId, orderId) => {
        try {
            let transObj = {
                _id: ObjectId(orderId),
                amount: price,
                Type: "credit",
                createdAt: new Date(),
            }

            let wallet = await db.wallet.findOne({ user: ObjectId(userId) })
            if (wallet) {
                
                let newBalance = parseInt(wallet.walletBalance) + parseInt(price)
                await db.wallet.updateOne(
                    { user: ObjectId(userId) },
                    { $set: { walletBalance: newBalance }, $push: { transaction: transObj } }
                )
            } else {
                
                let walletItem = new db.wallet({
                    user: ObjectId(userId),
                    walletBalance: price,
                    transaction: [transObj],
                })
                await walletItem.save()
            }
        } catch (error) {
            // Handle error here
            console.error(error)
        }
    },
    //get wallet amount and transactions
    walletData:async(userId)=>{
        try {
            let data=await db.wallet.findOne({user:ObjectId(userId)})
            
            return data || null;
            
        } catch (error) {
           // Handle error here
           console.error(error) 
        }
    },
    // //get wallet amount
    // getWalletAmount:async(userId)=>{
    //     try {
    //         let userWallet=db.wallet.findOne({user:ObjectId(userId)})
    //         return userWallet
            
    //     } catch (error) {
    //        // Handle error here
    //        console.error(error)  
    //     }
      

    // },
    //check wallet 
    checkWallet:async(userId)=>{
        try {
            let userWallet=db.wallet.findOne({user:ObjectId(userId)})
            return userWallet
        } catch (error) {
            // Handle error here
            console.error(error)   
        }

    },
    //debit from wallet
    debitFromWallet:async(userId,finalAmount)=>{
        let wallet= await db.wallet.findOne({user:ObjectId(userId)})
         let prevBalance =parseInt(wallet.walletBalance)
         const newBalance=prevBalance-parseInt(finalAmount)
         await db.wallet.updateOne({user:ObjectId(userId)},{$set:{walletBalance:newBalance}})

    }
      
}