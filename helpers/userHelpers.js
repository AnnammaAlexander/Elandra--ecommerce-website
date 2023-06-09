const db = require('../models/connection')
const bcrypt = require("bcrypt")
const { response } = require("../app");
const { promiseImpl } = require('ejs');
const objectId= require("mongodb").ObjectId
const Razorpay=require('razorpay')
const crypto=require('crypto');
const { use } = require('../routes/user');
const { log } = require('console');
const { resolve } = require('path');
module.exports = {
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
          try {
            // Initialize response object
            let response = {};
      
            // Find user by email
            let user = await db.user.findOne({ email: userData.email });
      
            if (user) {
              // Check if user is not blocked
              if (user.blocked === false) {
                // Compare password using bcrypt
                await bcrypt.compare(userData.password, user.Password).then((status) => {
                  if (status) {
                    // Set user in the response object
                    response.user = user;
      
                    // Resolve with success status
                    resolve({ response, status: true });
                  } else {
                    // Resolve with blocked status
                    resolve({ blockedStatus: false, status: false });
                  }
                });
              } else {
                // Resolve with blocked status
                resolve({ blockedStatus: true, status: false });
              }
            } else {
              // Resolve with blocked status
              resolve({ blockedStatus: false, status: false });
            }
          } catch (error) {
            // Handle any errors that occur
            console.error(error);
            throw error;
          }
        });
      },
 //login with otp
 findUserOtp:(number)=>{
    return new Promise(async (resolve, reject) => {
             try {
            let response = {}
            //check the phone number from the user collection
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
  resetPassword: async (body) => {
    try {
      // Hash the new password
      let hashedPassword = await bcrypt.hash(body.password2, 10);
  
      // Update the user's password with the hashed password
      let result = await db.user.updateOne({ _id: objectId(body.userId) }, { $set: { Password: hashedPassword } });
  
      return result;
    } catch (error) {
      // Handle any errors that occur
      console.error(error);
      throw error;
    }
  }
   ,
 // change password in user account
 updatePassword: (body) => {
    console.log("body", body);
    try {
      return new Promise(async (resolve, reject) => {
        try {
          let user = await db.user.findOne({ _id: objectId(body.userid) });
  
          console.log("user:", user);
  
          let response = await bcrypt.compare(body.password, user.Password);
          if (response) {
            let hashedPassword = await bcrypt.hash(body.password2, 10);
            console.log("hashedPassword", hashedPassword);
            await db.user.updateOne(
              { _id: objectId(body.userid) },
              { $set: { Password: hashedPassword } }
            );
            resolve({ status: true });
          } else {
            resolve({ status: false });
          }
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    } catch (error) {
      console.error(error);
    }

  },
   
//signup
    doSignUp: (userData) => {
        //console.log(db);
        let response = {}
        return new Promise(async (resolve, reject) => {


            try {
                email = userData.email;
                //checking the email is existing or not
                existingUser = await db.user.findOne({ email: email })
                //email is existing
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
                    //create new document in user collection
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
      try {
        // Find the user based on the provided email
        let user = await db.user.findOne({ email: data.email });
        resolve(user);
      } catch (error) {
        // Handle any errors that occur during the process
        reject(error);
      }
    });
  },
  

  
//cart count
getCartCount: async (userId) => {
    try {
      // Find out if the user has a cart collection
      const cartCount = await db.cart.findOne({ user: userId });
      if (cartCount) {
        // Return the count of the 'cartItems' array
        return cartCount.cartItems.length;
      } else {
        // If the user has no cart collection, the count is 0
        return 0;
      }
    } catch (error) {
      // Handle any errors that occur during the process
      throw error;
    }
  },
//list all products 
listProductShop: (page, perpage) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Find all products from the product collection
        const response = await db.product.find()
          .skip((page - 1) * perpage)
          .limit(perpage)
          .exec();
        resolve(response);
      } catch (error) {
        // Handle any errors that occur during the process
        reject(error);
      }
    });
  },

//get product qty from cart
getcartQty: async (userId, productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Find the cart items matching the user and product IDs
        const response = await db.cart.find({
          user: objectId(userId),
          "cartItems.productId": objectId(productId)
        });
  
        resolve(response);
      } catch (error) {
        // Handle any errors that occur during the process
        reject(error);
      }
    });
  },
  
//search item
searchItem: (key) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create a regular expression to perform case-insensitive search
        const regex = new RegExp(key, 'i');
  
        // Find products whose name matches the provided key
        const response = await db.product
          .find({ Productname: { $regex: regex } })
          .limit(5);
  
        // Map the response to extract relevant information
        const formattedResponse = response.map((product) => {
          return {
            _id: product._id,
            Productname: product.Productname
          };
        });
  
        resolve(formattedResponse);
      } catch (error) {
        // Handle any errors that occur during the process
        reject(error);
      }
    });
  },
//get product details from product 
showProductDetail: async (id) => {
    try {
      // Find the product with the provided ID
      const data = await db.product.findOne({ _id: objectId(id) });
  
      // Return the product data
      return data;
    } catch (error) {
      // Handle any errors that occur during the process
      console.log('Data not found:', error);
    }
  },
    //find the offer of a product
    findOffer: async (id) => {
        try {
          // Find the product with the provided ID and lookup its associated offer
          const offer = await db.product.aggregate([
            {
              $match: { _id: objectId(id) }
            },
            {
              $lookup: {
                from: "offers",
                localField: "category",
                foreignField: "CategoryName",
                as: "result"
              }
            },
            {
              $unwind: '$result'
            }
          ]);
      
          // Return the offer details
          return offer;
        } catch (error) {
          // Handle any errors that occur during the process
          throw error;
        }
      },
//get offer for shop page
getOffer: async () => {
    try {
      // Retrieve offers by performing an aggregation
      const offer = await db.product.aggregate([
        {
          $lookup: {
            from: "offers",
            localField: "category",
            foreignField: "CategoryName",
            as: "result"
          }
        },
        {
          $unwind: "$result"
        }
      ]);
  
      // Return the retrieved offer details
      return offer;
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
    }
  },

//get all products from product
getShopHelper: () => {
    try {
      return new Promise(async (resolve, reject) => {
        // Retrieve products from the product collection
        await db.product.find().sort({ _id: -1 }).exec().then((response) => {
          // Resolve with the retrieved products
          resolve(response);
        });
      });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
    }
  },
//get  products based on category
getcategoryProduct: (data) => {
    try {
      return new Promise(async (resolve, reject) => {
        // Retrieve products from the product collection based on the category
        await db.product.find({ category: data }).sort({ _id: -1 }).then((response) => {
          // Resolve with the retrieved products
          resolve(response);
        });
      });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
    }
  },
//get all categories
getShopHelperCategory: () => {
    try {
      return new Promise(async (resolve, reject) => {
        // Retrieve categories from the category collection
        await db.category.find().exec().then((response) => {
          // Resolve with the retrieved categories
          resolve(response);
        });
      });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
    }
  },
//view cart page
getCartPage: () => {
    try {
      return new Promise(async (resolve, reject) => {
        // Retrieve cart items from the cart collection
        await db.cart.find().exec().then((response) => {
          // Resolve with the retrieved cart items
          resolve(response);
        });
      });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
    }
  },
//find username 
useraccountFindName: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        // Find the user by user ID in the user collection
        await db.user.findOne({ _id: objectId(userId) }).then((response) => {
          // Resolve with the username of the user
          resolve(response.username);
        });
      });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
    }
  },
//add new address
addAddress: (userId, data) => {
    try {
      const addressObj = {
        firstName: data.name,
        lastName: data.Lname,
        street: data.billingaddress2,
        building: data.billingaddress,
        city: data.city,
        state: data.state,
        pincode: data.zipcode,
        mobile: data.phone,
      };
  
      return new Promise(async (resolve, reject) => {
        let addressDetails = await db.address.findOne({ user: objectId(userId) });
        let message = 'Address added';
        if (addressDetails === null) {
          const AddressDetails = new db.address({
            user: objectId(userId),
            Address: addressObj,
          });
          await AddressDetails.save().then(() => {
            
            resolve(message);
          });
        } else {
          await db.address.updateOne(
            { user: objectId(userId) },
            { $push: { Address: addressObj } }
          );
          resolve(message);
        }
      });
    } catch (error) {
      console.error(error);
    }
  },
//view address
getAddress:(userId)=>{
    try{
        return new Promise(async (resolve, reject) => {
            //get all the address from the addres collection
            const userAddress= await db.address.findOne({'user': userId});
            resolve(userAddress);
         });
    }catch(error){

    }
},

//edit address
getEditAddress: (addressId, userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        // Query to find and return the edited address
        const editAddress = await db.address.findOne(
          {
            user: objectId(userId),
            'Address._id': objectId(addressId)
          },
          {
            'Address.$': 1,
            _id: 0
          }
        );
        console.log("Edited address:", editAddress);
        resolve(editAddress);
      });
    } catch (error) {
      console.error(error);
    }
  },
//find the address from user address collection

findAddress: (addressId, userId) => {
    // Return a Promise to handle the asynchronous operation
    return new Promise(async (resolve, reject) => {
      try {
        // Find the address based on the provided address ID and user ID
        const adrs = await db.address.findOne(
          { user: objectId(userId), 'Address._id': objectId(addressId) },
          { 'Address.$': 1, _id: 0 }
        );
  
        // Resolve the Promise with the found address
        resolve(adrs);
      } catch (err) {
        // Reject the Promise with the encountered error
        reject(err);
      }
    });
  },
//add order to the db
addOrder: async (address, cart, total, name, payment, userId, paymentStatus) => {
    try {
      total = total;
  
      // Create a new order object
      const orderObj = new db.order({
        userId: objectId(userId),
        name: name,
        productDetails: cart,
        paymentMethod: payment,
        paymentStatus: paymentStatus,
        totalPrice: total,
        shippingAddress: address,
        orderStatus: 'confirmed',
        _id: new objectId()
      });
  
      // Generate a hashed ID for the order
      let id = orderObj._id;
      const hash = crypto.createHash('sha256');
      hash.update(id.toString());
      let userHashId = hash.digest('hex').slice(0, 6);
      orderObj.hashedId = userHashId;
  
      // Save the order to the database
      let order = await orderObj.save();
  
      // Resolve the Promise with the order ID
      return Promise.resolve(order._id);
    } catch (error) {
      console.error(error);
      // Reject the Promise with the encountered error
      return Promise.reject(error);
    }
  },
//get all address
GetAlldAddress:(userId)=>{
    return new Promise(async (resolve, reject) => {
        try {
            const Addres = await db.address.find({ user:objectId(userId )}).limit(10);
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
//

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


//razor pay
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

        console.log('payment sign & receipt',paymentInfo["order[razorpay_signature]"],paymentInfo["payment[receipt]"]);

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
emptyCart: async (userId) => {
    try {
      // Update the cart by setting the cartItems array to an empty array
      await db.cart.updateOne(
        { "user": objectId(userId) },
        { $set: { cartItems: [] } }
      );
    } catch (error) {
      console.error(error);
      // Handle the error appropriately, such as logging or throwing it
    }
  },
//sort products by price
sortByPrice: (data, category) => {
    try {
      // Set the default order to ascending (Low to high)
      let order = 1;
  
      // Check if the data is 'High to low'
      if (data === 'High to low') {
        // Change the order to descending (High to low)
        order = -1;
      }
  
      // Check if a category is specified
      if (category) {
        // Find products in the specified category and sort them by price
        return db.product.find({ category: category }).sort({ Price: order });
      } else {
        // Find all products and sort them by price
        return db.product.find().sort({ Price: order });
      }
    } catch (error) {
      // Throw an error if an exception occurs
      throw new Error('An error occurred while sorting by price');
    }
  },
  //// update used coupons to user collection
  addCouponToUser: async (userId, coupon) => {
    try {
      // Check if the coupon is not empty
      if (coupon !== '') {
        // Add the coupon to the user's coupons array
        await db.user.updateOne(
          { _id: objectId(userId) },
          { $push: { coupons: coupon } }
        );
      }
      // Resolve the promise
      resolve();
    } catch (error) {
      // Handle the error appropriately, such as logging or rejecting the promise
      console.error(error);
      reject(error);
    }
  },
  getallCategory: () => {
    try {
      return new Promise(async (resolve, reject) => {
        let response = await db.category.find();
        resolve(response);
      });
    } catch (error) {
      reject(error);
    }
  },
  
  updateStock:(body)=>{
    console.log(";;;;;;;;;;;;;;;;;;;;;",body);
  }


}


