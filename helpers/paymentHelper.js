const { response } = require('express')
const db= require('../models/connection')
const { Promise } = require('mongoose')
const ObjectId=require("mongodb").ObjectId
const moment=require('moment')
module.exports = {
    //update wallet amount
    getTotalPrice: (orderId) => {
        return new Promise(async (resolve, reject) => {
          try {
            // Find the total price of the order with the provided orderId
            const totalAmt = await db.order.aggregate([
              {
                $match: { _id: ObjectId(orderId) }
              },
              {
                $project: {
                  totalPrice: 1,
                  _id: 0
                }
              }
            ]);
      
            console.log("total price", totalAmt);
      
            resolve(totalAmt);
          } catch (error) {
            reject(error);
          }
        });
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
   
    debitFromWallet: async (userId, finalAmount) => {
        try {
          // Find the wallet document for the user
          let wallet = await db.wallet.findOne({ user: ObjectId(userId) });
      
          // Retrieve the previous wallet balance and calculate the new balance
          let prevBalance = parseInt(wallet.walletBalance);
          const newBalance = prevBalance - parseInt(finalAmount);
      
          // Update the wallet balance with the new value
          await db.wallet.updateOne({ user: ObjectId(userId) }, { $set: { walletBalance: newBalance } });
        } catch (error) {
          throw error;
        }
      }
      
      
}