const db = require('../models/connection')
const bcrypt = require("bcrypt")
const { response } = require("../app");
const { promiseImpl } = require('ejs');
const objectId= require("mongodb").ObjectId
const Razorpay=require('razorpay')
const crypto=require('crypto');
const { use } = require('../routes/user');
const { log } = require('console');
module.exports = {
    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            
            try {
                let response = {}
                let users = await db.user.findOne({ email: userData.email })
                if (users) {
                    if (users.blocked == false) {
                        await bcrypt.compare(userData.password, users.Password).then((status) => {
                            if (status) {
                                response.user = users
                                // response.status
                                resolve({ response, status: true })
                            } else {
                                resolve({ blockedStatus: false, status: false })
                            }
                        })
                    }
                    else {
                        resolve({ blockedStatus: true ,status:false})
                    }


                } else {
                    resolve({ blockedStatus: false , status: false })
                }
            } catch (err) {
                console.log(err);
            }
        })


    },
 //login with otp
 findUserOtp:(number)=>{
    return new Promise(async (resolve, reject) => {
            
        try {
            let response = {}
            
            let users = await  db.user.findOne({phonenumber:number})
            if (users) {
                if (users.blocked == false) {
                    
                            response.user = users
                            // response.status
                            resolve({ response})
                        
                    
                }
                else {
                    resolve({ blockedStatus: true })
                }


            } else {
                resolve({ blockedStatus: false , })
            }
        } catch (err) {
            console.log(err);
        }
    }) 
 },

  //reset password
  resetPassword:async(body)=>{
     let hashPassword = await bcrypt.hash(body.password2, 10);
     let result= await db.user.updateOne({_id:objectId(body.userId)},{$set:{Password:hashPassword}})
      return result
  } ,
   
//signup
    doSignUp: (userData) => {
        //console.log(db);
        let response = {}
        return new Promise(async (resolve, reject) => {


            try {
                email = userData.email;
                existingUser = await db.user.findOne({ email: email })
                if (existingUser) {
                    response = { status: false }
                    return resolve(response)
                }
                else {
                    var hashPassword = await bcrypt.hash(userData.password, 10);
                    const data = {
                        username: userData.username,
                        Password: hashPassword,
                        email: userData.email,
                        phonenumber: userData.phonenumber
                    }
                    console.log(data);
                    await db.user.create(data).then((data) => {
                        resolve({ data, status: true })
                    })

                }

            }
            catch (err) {
                console.log(err)
            }
        })
    },
//reset password
passwordReset: (data) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.user.findOne({email:data.email});
      resolve(user)
    });
  },
  

  
//cart count
 getCartCount: async (userId) => {
  try {
    const cartCount = await db.cart.findOne({user:userId});
    if (cartCount) {
      return cartCount.cartItems.length;
    } else {
      return 0;
    }
  } catch (error) {
    throw error;
  }
},
//list all products 
listProductShop:(page,perpage)=>{
    return new Promise(async(resolve, reject) => {
        await db.product.find(). skip((page-1)*perpage).limit(perpage).then((response)=>{
            resolve(response)
        })
    })
       
    
    
},

//get product qty from cart
getcartQty:async(userId, productId) => {
    return new Promise(async(resolve, reject) => {
        
        await db.cart.find({user:objectId(userId),"cartItems.productId":objectId(productId)}).then((response)=>{
        
            resolve(response)
        })
    })
    
  },
  
//search item
searchItem:(key)=>{
    console.log('keyyyyyy',key);
    return new Promise(async(resolve, reject) => {
        const Regex= new RegExp(key,'i')
        await db.product.find({Productname:{$regex:Regex}}).then((response)=>{
            console.log("response",response);
            response=response.map((product)=>{
            return {_id:product._id,Productname:product.Productname}
            })
            console.log(response);
        resolve(response)
        })
    })

},
//get product details from product 
    showProductDetail:async(id)=>{

        try {
            let data = await db.product.findOne({_id:objectId(id)})
            return data
        } catch (error) {
            console.log('data not found');
            
        }
       
    },


//get all products from product
 getShopHelper:()=>{
                 return new Promise(async(resolve, reject) => {
                         await db.product.find().sort({_id:-1}).exec().then((response)=>{
                            resolve(response)
                
            })
        })
      
},
//get shop product based on category
getcategoryProduct:(data)=>{
    return new Promise(async(resolve, reject) => {
        await db.product.find({category:data}).sort({_id:-1}).then((response)=>{
    resolve(response)
        })
    })
},
//get all categories
getShopHelperCategory:()=>{
    return new Promise(async(resolve, reject) => {
        await db.category.find().exec().then((response)=>{
            resolve(response)
        })
    })
},
//view cart page
getCartPage:()=>{
    return new Promise(async(resolve, reject) => {
        await db.cart.find().exec().then((reeponse)=>{
            resolve(response)
        })
        
    })
},
//find username 
useraccountFindName:(userId)=>{
    return new Promise(async(resolve, reject) => {
        await db.user.findOne({_id:objectId(userId)}).then((response)=>{
            resolve(response.username)
        })
    })
},
//add new address
addAddress:(userId,data)=>{
    addressObj={
        firstName:data.name,
              lastName:data.Lname,
              street:data.billingaddress2,
              building:data.billingaddress,
              city:data.city,
              state:data.state,
              pincode:data.zipcode,
              mobile:data.phone,
              }
              return new Promise(async(resolve, reject) => {
                let addressDetails=await db.address.findOne({"user":objectId(userId)})
                if(addressDetails===null){
                  const  AddressDetails=new db.address({"user":objectId(userId),
                                                      Address:addressObj })
                    await AddressDetails.save().then(()=>{
                        let message='Address added'
                        resolve(message)
                    })
                }else{
                    await db.address.updateOne({"user":objectId(userId)},{$push:{"Address":addressObj}})
                    resolve()
                    
                }
              })

},
//view address
getAddress:(userId)=>{
    try{
        return new Promise(async (resolve, reject) => {
            const userAddress= await db.address.findOne({'user': userId});
            resolve(userAddress);
         });
    }catch(error){

    }
},
//edit address
getEditAddress:(addressId,userId)=>{
    console.log(objectId(addressId),objectId(userId));
    return new Promise(async(resolve, reject) => {
    const editadrs=   await db.address.findOne({'user':objectId(userId),'Address._id':objectId(addressId)},{'Address.$':1,'_id':0})
    console.log("edited adrs:",editadrs);
     resolve(editadrs)
    })
},





findAddress:(addressId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const adrs = await db.address.findOne(
        { user: objectId(userId), 'Address._id': objectId(addressId) },
        { 'Address.$': 1, _id: 0 }
      );

      resolve(adrs);
    } catch (err) {
      reject(err);
    }
  });
},
addOrder:async(address,cart,total,name,payment,userId,paymentStatus)=>{
    try{
        total = total
        const orderObj = new db.order({
        userId:objectId(userId),
    
        name:name,
        productDetails:cart,
        paymentMethod:payment,
        paymentStatus: paymentStatus,
        totalPrice:total,
        shippingAddress:address,
        orderStatus: 'confirmed',
        _id:new objectId()
        })
        //hashed id
         //hashing id
         let id =orderObj._id 
         const hash = crypto.createHash('sha256');
         hash.update(id.toString());
         let userHashId= hash.digest('hex').slice(0, 6);




         orderObj.hashedId=userHashId

       let order= await orderObj.save();


console.log("orderid:",order._id);
        return Promise.resolve(order._id);

    }catch(error){
        console.error(error);
        return Promise.reject(error);

    }
},
//get all address
GetAlldAddress:( userId)=>{
    return new Promise(async (resolve, reject) => {
        try {
            const Addres = await db.address.find({ userId:objectId(userId )}).limit(10);
            resolve(Addres);
        } catch (error) {
            reject(error);
        }
    });
},
//get all orders
findOrders:(userId,page,perpage)=> {
    return new Promise(async (resolve, reject) => {
        try {
            const orders = await db.order.find({ userId:objectId(userId )}).limit(10);
            resolve(orders);
        } catch (error) {
            reject(error);
        }
    });
},
orderDetails:(id,userId)=>{
   return new Promise(async(resolve, reject) => {
    try {
        const order = await db.order.findOne({ userId:objectId(userId ), _id:objectId(id)}).exec();
        resolve(order);
    } catch (error) {
        reject(error);
    }
   }) ;
},



getRazorpay: (orderId,total) => {
    console.log("getRazorpay",orderId,total);
    try {
      return new Promise((resolve) => {
        const razorpay = new Razorpay({
          // eslint-disable-next-line no-undef
          key_id: process.env.RAZORPAY_KEY_ID,
          // eslint-disable-next-line no-undef
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
        const options = {
          amount:total * 100,
          currency: "INR",
          receipt: "" + orderId,
          payment_capture: 1,
        }
        razorpay.orders.create(options, function (err, order) {
          if (err) {
            console.log(err)
          } else {
            resolve(order)
          }
        })
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to get razorpay")
    }
},

//verify razorpay payment
verifyPaymentRazorpay:(paymentInfo) => {

    try {
      return new Promise((resolve, reject) => {
        let hmac = crypto.createHmac("sha256", "BkxSNLVpdSFWMB4Sf6TOk4Qf")
        hmac.update(
          paymentInfo["order[razorpay_order_id]"] +
            "|" +
            paymentInfo["order[razorpay_payment_id]"]
        )
        
        hmac = hmac.digest("hex")
        console.log('-----------------',hmac);

        console.log('payment',paymentInfo["order[razorpay_signature]"]);

        if (hmac === paymentInfo["order[razorpay_signature]"]) {

            resolve({ status: true ,orderId: paymentInfo["payment[receipt]"]})
        } else {
            reject({ status: false ,orderId: paymentInfo["payment[receipt]"]})
        }
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to verify razorpay payment")
}
},
//delete cart at the time of order creation
emptyCart:async(userId)=>{
    try {
        await db.cart.updateOne(
            { "user": objectId(userId) },
            {$set:{cartItems:[]}}
        );
    } catch (error) {
       console.log("Action not complete ,the cart is not empty"); 
    }
},
//view banner



}


