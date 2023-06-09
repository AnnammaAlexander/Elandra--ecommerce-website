const { response } = require('../app');
const helpers = require('../helpers/userHelpers')
const otpLogin = require("../OTP/otpLogin");
const user = require("../models/connection");
const userHelpers = require('../helpers/userHelpers');
const cartHelper = require('../helpers/cartHelper');
const wishListHelper=require('../helpers/wishListHelper')
const bannerHelper=require('../helpers/bannerHelper')
const paymenthelper=require('../helpers/paymentHelper')
const productHelper=require('../helpers/productHelper')
const { rmSync } = require('fs');
const { resolve } = require('path');
const session = require('express-session');
const db=require('../models/connection')
const client = require("twilio")(otpLogin.AccountSId, otpLogin.authtoken);
const objectId= require("mongodb").ObjectId

var userSession, loginStatus;

let number, OtpNumber
module.exports = {

//view home page
getHome: async (req, res) => {
  try {
    let cartCount = 0;
    let wishCount = 0;

    if (req.session.userLoggedIn) {
      logheader = true;
      cartCount = await userHelpers.getCartCount(req.session.users._id);
      req.session.cartCount = parseInt(cartCount);

      // Get banners
      let banners = await bannerHelper.viewBanner();

      // Get wishlist count
      wishcount=await wishListHelper.wishlistcount(req.session.users._id)

      // Get some latest products
      let products = await productHelper.getProduct();

      // Get featured products
      let Featured = await productHelper.getFeatured();

      // Get popular products
      let Popular = await productHelper.getPopular();

      let category= await userHelpers.getallCategory();

      res.render('user/index', {
        userSession,
        logheader,
        cartCount,
        banners,
        wishcount,
        products,
        Featured,
        Popular,
        category
      });
    } else {
      logheader = false;

      let banners = await bannerHelper.viewBanner();

      let products = await productHelper.getProduct();

      let Featured = await productHelper.getFeatured();

      let Popular = await productHelper.getPopular();

      let category= await userHelpers.getallCategory();

      res.render('user/index', {
        logheader,
        loginStatus,
        banners,
        cartCount,
        wishCount,
        products,
        Featured,
        Popular,
        category
      });
    }
  } catch (error) {
    throw error;
  }
},
  getUserLogin: (req, res) => {
    if (req.session.userLoggedIn) {
      res.redirect('/')
    } else {

      res.render("user/login", { logheader: false });
    }
  },


//loginpost
  postUserLogin: (req, res) => {
    console.log(req.body);
    helpers.doLogin(req.body).then((response) => {
      
      let loggedInStatus = response.status;
      let blockedStatus = response.blockedStatus;
      if (loggedInStatus == true) {

        req.session.users = response.response.user;
        
        req.session.userLoggedIn = true;
        userSession = req.session.userLoggedIn;
        res.redirect('/');
      } else {
        blockedStatus;
        res.render("user/login", { loggedInStatus, blockedStatus });
      }
    })

  },



//view signup page
  getSignUP: (req, res) => {
    
    emailStatus = true
    res.render("user/signup", { emailStatus, logheader: false });
  },
//post signup page
  postSignup: (req, res) => {
    helpers.doSignUp(req.body).then((response) => {
      var emailStatus = response.status
      if (emailStatus) {
        res.redirect('/login')
      }
      else {
        res.render('user/signup', { emailStatus })
      }
    })

  },
  //get otp page
  getOtp: (req, res) => {
    res.render("user/otp")
  },
// get verification of otp page
  getVerify: (req, res) => {
    res.render('user/otpLogin')
  },

//verify the otp
  postOtp: async (req, res) => {
    number = req.body.phonenumber;

    let users = await user.user.find({ phonenumber: number }).exec();

    if (users == false) {
      console.log('no. user');
      res.render("/login");
    } else {
      console.log('user');

      client.verify.v2
        .services(otpLogin.servieceId)
        .verifications.create({ to: `+91 ${number}`, channel: "sms" })
        .then()
        .then(() => {
          const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          res.redirect("/otp_verify");
        });
    }
  },

//verify the otp
  postVerify: async (req, res) => {
    console.log(number);
    let OtpNumber = req.body.otp;
    console.log(OtpNumber);
    await client.verify.v2
      .services(otpLogin.servieceId)
      .verificationChecks.create({ to: `+91 ${number}`, code: OtpNumber })
      .then(async (verification_check) => {
        console.log(verification_check);

        if (verification_check.valid) {


// let response= await userHelpers.findUserOtp(number)
// console.log("....response:",response);
          

          console.log("redirect/...........................................");
          res.redirect("/")
        } else {
          res.render("user/otpLogin", { invalidOtp: true });
        }
      });
  },
  //view forgot password page
  getforgotPassword:(req,res)=>{
    res.render("user/forgotPassword",{userSession, logheader:false})
  },
//post forgot password-verify the email id
postforgotpassword:async(req,res)=>{
let data =req.body
await userHelpers.passwordReset(data).then((response)=>{
  if(response){
    console.log("lllllllllllllllresponse",response);
    let userid=response._id
    
    res.render("user/resetPassword",{userSession,userid,logheader:false})
  }else{
    res.redirect('/forgot-password')
  }
})
},
//

//password submit -after the verification of email 
changePassword:async(req,res)=>{

  await userHelpers.resetPassword(req.body)
  res.json(true)
},
//reset password in user account-profile
resetPasswordUser:async(req,res)=>{
  console.log("body:",req.body)
  await userHelpers.updatePassword(req.body).then((status)=>{
    
    res.json(status)
  })


},
//search
searchItems:async(req,res)=>{

let key=req.body.key
 let response=await userHelpers.searchItem(key)
 
 res.json(response)

},
//view shop pae
getShop: async (req, res) => {
  try {
    let cartCount = 0;
    let wishcount = 0;
    let userId
    // pagination 
    const page = req.query.page || 1;
    const perpage = 10;
    const count = await db.product.countDocuments({});
    const orderListCount = count;
    // list product details
    let response = await userHelpers.listProductShop(page, perpage);
    // list category
    let procategory = await userHelpers.getShopHelperCategory();
    let logheader = false; // Assume user is not logged in
    //offer details
    if (req.session.userLoggedIn) {
      userId = req.session.users._id
      logheader = true;
      cartCount = await userHelpers.getCartCount(req.session.users._id);
      req.session.cartCount = parseInt(cartCount);
      // get wishlist count
      wishcount = await wishListHelper.wishlistcount(req.session.users._id);
    }

    // Pass the userSession value directly to the template
    const userSession = req.session.userLoggedIn;

    res.render('user/shop', {
      logheader,
      userSession,
      response,
      procategory,
      cartCount,
      wishcount,
      userId,
      pages: Math.ceil(orderListCount / perpage)
    });
  } catch (error) {
    console.error(error);
    // Handle the error and send an appropriate response
    res.status(500).send('An error occurred. Please try again later.');
  }
},

 //view products based on category
 categoruProducts:async(req,res)=>{
  let data=req.query.data
await userHelpers.getcategoryProduct(data).then((result)=>{
  console.log("response");
  res.json(result)
})

 } ,
//sort products by price
sortProducts:async(req,res)=>{
let data=req.query.data
let category=req.query.category
console.log(data,category);
 await userHelpers.sortByPrice(data,).then((response)=>{
  res.json(response)
 })

},
//view product details of each product
  product_detail: async (req, res) => {

    let cartCount = 0
    let wishcount=0
    let id = req.params.id
    let userId
    let response = await userHelpers.showProductDetail(id)
    let offer= await userHelpers.findOffer(id)

    console.log(offer,'----------------------------');

    if (req.session.userLoggedIn) {
       userId = req.session.users._id
      logheader = true
      cartCount = await userHelpers.getCartCount(req.session.users._id)
      req.session.cartCount = parseInt(cartCount)
      logheader = true
      //get wishlist count
      wishcount=await wishListHelper.wishlistcount(req.session.users._id)
    
    } else {
      logheader = false
      //console.log(logheader);

      
    }
    console.log(offer);
    res.render('user/shopProduct', { logheader, userSession, response, cartCount,wishcount ,userId,offer})
  },



  //view cart page
  dummygetViewCart: async (req, res) => {
let cartCount=0
let wishcount=0

    if (req.session.userLoggedIn) {
      logheader = true
      const userId = req.session.users._id
      //cart count checking 
      cartCount = await userHelpers.getCartCount(userId)
      req.session.cartCount = parseInt(cartCount)
        //get wishlist count
     wishcount=await wishListHelper.wishlistcount(req.session.users._id)
      //aggregate cartitems  from cart & product collection
      let cartItems = await cartHelper.viewCart(userId)
      if(cartItems.length!==0){
      let total = await cartHelper.grandTotal(userId)
      grandtotal = total[0].total;
      }else{
       grandtotal=0
      }
      res.render("user/cartDummy", { cartItems, userId, grandtotal ,logheader,userSession, cartCount,wishcount})
    } else {
      logheader = false
      res.render('user/index', { userSession, logheader })
    }


  },


//add to cart
addToCart:async (req, res) => {
  try {
    let productId = req.params.id;
    let userId = req.session.users._id;
    //find quantity of product from cart
    let data = await userHelpers.getcartQty(userId, productId);
    console.log("data", data);
    let qty=0
    if(data.length){
      qty = data[0].cartItems[0].Quantity;
    }   
    //get product details
    let product = await userHelpers.showProductDetail(productId);
    let stock = product.Quantity;
    let availableStock = stock - qty;

    if (availableStock > 0) {
      // products add to cart
      await cartHelper.addToCartHelper(userId, productId, product.Price);
      res.json(true);
    } else {
      res.json({ outOfStock: true });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
},


//update quantity in cart using ajax
  AjaxUdateCart: async (req, res) => {
    let productId = req.body.proId
    let userId = req.session.users._id

    let qty = parseInt(req.body.quantity)
    let subTotal = parseInt(req.body.subtotal)
    let count = parseInt(req.body.count)
    let totalQuantity = parseInt(req.body.totalQuantity)
   
    const updateqty = count + qty
    console.log("updateqty",updateqty);
    // if the product qty 0,then delete the product from cart 
     if (updateqty === 0) {
      await cartHelper.deleteProInCart(productId, userId)
      res.json(response)
     } else {
      await cartHelper.postUpdateCart(productId, userId, subTotal, updateqty, count)
      total = await cartHelper.grandTotal(userId)
      console.log("total,,,,,,,,,,,,,,,,,,,,,,,",total);
      grandtotal = total[0].total;
       res.json(grandtotal)
    }
  },

//delete cartitem from cart
  ajaxDeleteProduct: async (req, res) => {
    if (req.session.userLoggedIn) {
      let productId = req.params.id
      let userid = req.session.users._id
      await cartHelper.deleteProInCart(productId, userid)
      res.json(true)
    }
  },
  //checck wallet amount
  checkWalletAmount:async(req,res)=>{
    let walletBal=0
    let grandtotal=req.query.grandTotal
    let userId=req.session.users._id
    let response= await paymenthelper.checkWallet(userId)
    if(response!==null){
      walletBal=response.walletBalance
      if(walletBal<grandtotal){
        res.json(true)
      }

    }else{
      res.json(true)
    }
    

   

  },

//view/get  checkout page
  getCheckout: async (req, res) => {
    let cartCount = 0
     let wishcount =0
    if (req.session.userLoggedIn) {
      logheader = true
     //get wishlist count
     wishcount=await wishListHelper.wishlistcount(req.session.users._id)
      let userId = req.session.users._id
      //get cart items
      let cartItems = await cartHelper.viewCart(userId)
      //get grand total
    //  let total = await cartHelper.grandTotal(userId)
    // let grandtotal = total[0].total;
      //get user address
       let userAddress = await userHelpers.getAddress(userId)
       
      //get wallet amount
      // let WalletAmt=await paymenthelper.getWalletAmount(userId)
      // let WalletAmount= WalletAmt.walletBalance
      

      res.render('user/checkout', { userSession, logheader, cartCount, cartItems, grandtotal, userAddress,wishcount,userId })
    } else {
      logheader = false
      res.render('user/index', { userSession, logheader ,wishcount})
    }
  },

  //place order
  postCheckout: async (req, res) => {
    
    let userId = req.session.users._id
    let name = req.session.users.username
    let discount=parseInt(req.body.discountHidden)
    let Gtotal=req.body.totalhidden
    let grandTotalFromAjax=parseInt(req.body.totalhidden)
    
    
   
//get wishlist count
    let wishcount=await wishListHelper.wishlistcount(req.session.users._id)
//get address of a user
let address
if(req.body.addressId){
  await userHelpers.updateStock(req.body)
  console.log('insideadress',req.body.addressId);
  address = await userHelpers.findAddress(req.body.addressId, userId)

   
 //view all cart item
    let cart = await cartHelper.viewCart(userId)
    console.log(";;;;;;;;;;;;;;;;cart",cart);
    let total = await cartHelper.grandTotal(userId)

    let grandtotal = total[0].total;
    let payment = req.body.payment_option
    
    

    const paymentStatus =payment==='COD'?'placed':'pending' 
    let finalAmount
    //check the final amount accoding to the coupon applied
    if(req.body.Coupon==''){
      finalAmount=parseInt(grandtotal)
    }else{
      finalAmount=grandTotalFromAjax
    }
    
    for(let i=0;i<cart.length;i++){
      await db.product.updateOne({_id:objectId(cart[i].item)},{$inc:{Quantity:-(cart[i].Quantity)}})
    }
      
    //add order 
    let orderId = await userHelpers.addOrder(address.Address, cart, finalAmount, name, payment, userId, paymentStatus,wishcount)
    console.log("payment/:",payment);
    let response={}
    
    if (payment === 'COD') {
      console.log('testcod');
     await userHelpers.emptyCart(userId)
     await userHelpers.addCouponToUser(userId,req.body.Coupon)
      response.COD=true
      response.OrderID=orderId
      
      res.json(response)
    }else if(payment==='Razorpay'){
    await  userHelpers.getRazorpay(orderId,finalAmount).then((response)=>{
        response.Razorpay=true
        
        
           res.json(response)
    })
    } else {
      await paymenthelper.debitFromWallet(userId,finalAmount)
      await userHelpers.emptyCart(userId)
     await userHelpers.addCouponToUser(userId,req.body.Coupon)
      response.wallet=true
        response.OrderID=orderId
        res.json(response)
    }

  }else{
    console.log('noaddresss');
    res.json({noAddress:true})
  }
    
  


  },
 
  //view user account page
getUserAccount: async (req, res) => {
  let cartCount = 0;
  let wishcount=0
  let logheader = false;
  let userSession = req.session.userLoggedIn;
 

  if (userSession) {
    let userId = req.session.users._id;
    logheader = true;
    //find username
    let username = await userHelpers.useraccountFindName(userId);
    //get wishlist count
     wishcount=await wishListHelper.wishlistcount(req.session.users._id)
    
//get all orders of a user
    let orderedList = await userHelpers.findOrders(userId,);
    //get all address
    let address = await userHelpers.GetAlldAddress( userId)
    //get order count
    let orderCount=await db.order.countDocuments({userId:objectId(userId)})
    //get wallet amount and transactions
    let walletData= await paymenthelper.walletData(userId)
     cartCount = await userHelpers.getCartCount(userId)
   
    res.render("user/myAccount", {
      userSession,
      logheader,
      cartCount,
      username,
      orderedList,
     address,
     wishcount,
     orderCount,
     walletData,
     userId

    });
  } else {
    res.redirect("/user/login");
  }
},

  //add user address
  postAddress: (req, res) => {
    let userId = req.session.users._id
    userHelpers.addAddress(userId, req.body)

    res.redirect('/user-account')
  },





  
//edit address page
  getEditAddress: (req, res) => {

    let addressid = req.params.id

    console.log("session.users._id : ", req.session.users._id);
    userHelpers.getEditAddress(addressid, req.session.users._id).then((response) => {
      res.render('user/editAddress')
    })
  },
  getOrderSuccess: async(req, res) => {
    let orderid= req.query.oid

    const cartCount = 0
    let userId = req.session.users._id
    let cartItems = await cartHelper.viewCart(userId)
    res.render('user/orderSuccess', { logheader: false, userSession, cartCount,cartItems ,orderid})
  },
  //view order detail page
  // orderDetails:(req,res)=>{
  //   const cartCount = 0
  //   res.render('user/viewOrderProduct', { logheader:true, userSession, cartCount ,orderDetails})
  // },
  //view orderlist page
  getViewOrders: async(req, res) => {
    let userId = req.session.users._id
    let orderedList = await userHelpers.findOrders(userId)
    let cartCount = 0
    let wishcount=0
    //get wishlist count
    wishcount=await wishListHelper.wishlistcount(req.session.users._id)
    console.log("orderedList:", orderedList);
    res.render('user/viewOrders', { cartCount,logheader: true, userSession, orderedList, wishcount})
  },
  viewOrederProduct:async (req, res) => {
    let  wishcount=0
    if (req.session.userLoggedIn) {
      logheader = true
    let id = req.params.id
    let userid=req.session.users._id
  //get wishlist count
    wishcount=await wishListHelper.wishlistcount(req.session.users._id)
    let orderDetails= await userHelpers.orderDetails(id,userid)
    let cartCount = 0
    
    let orderStatus=orderDetails.orderStatus
    res.render('user/viewOrderProduct', { logheader:true, userSession, cartCount ,orderDetails,wishcount,orderStatus})
    }else{
      logheader=false
      res.render('user/index', { userSession, logheader })
    }
  },
  //return oredred product
  returnProduct:async(req,res)=>{
   let reson=req.body.reason
   let user=req.session.users._id
    console.log("session:",req.session);
   // return amount to Wallet//get total wallet amount
   
   let totalAmt= await paymenthelper.getTotalPrice(req.body.id)
   console.log("totalAmt",totalAmt);
    price=totalAmt[0].totalPrice
    console.log("price",price);
    //update wallet
    await paymenthelper.refundToWallet(price,user,req.body.id)
  //update orderStatus 
  await db.order.updateOne(
    { _id: req.body.id },
    {
      $set: {
        orderStatus: 'Returned',
        ResonForReturn: reson
      }
    }
  );
  

    res.json(true)
  },
//cancel order
cancelOrder:async(req,res)=>{
  
  await db.order.updateOne({_id:req.body.orderid},{$set:{orderStatus:'Canceled by User'}})
  res.json(true)
},
//get or view wishlist page
  getWishLish: async(req, res) => {
     let cartCount = await userHelpers.getCartCount(req.session.users._id)
    let wishlistItems= await wishListHelper.wishlist(req.session.users._id)
    let wishcount=await wishListHelper.wishlistcount(req.session.users._id)
    
  
    res.render('user/shopWishlist', { logheader: true, userSession, cartCount,wishlistItems,wishcount })
  },
//add product to wishlist
addWishList:async(req,res)=>{
let proId=req.body.proId
let userId=req.session.users._id
let product = await userHelpers.showProductDetail(proId)
let price=product.Price

await wishListHelper.addToWishlist(proId,userId,price)
res.json(true)
},
deleteWishlist:async(req,res)=>{
  let proid=req.params.id
  let userId=req.session.users._id
await wishListHelper.deleteWishlistItem(proid,userId)
res.json(true)
},
//add to cart from wishlist
addToCartFromWishlist:async(req,res)=>{
  let proid=req.query.id
  let userId=req.session.users._id
  let product = await userHelpers.showProductDetail(proid)
  let price=product.Price
  await cartHelper.addToCartHelper(userId,proid,price)
  await wishListHelper.deleteWishlistItem(proid,userId)
  res.json(true)
},




  //razor pay
  verifyPayment:(req,res)=>{
    userHelpers.verifyPaymentRazorpay(req.body).then((result)=>{  
      res.json(result)
    })
  },
  //logout 
  getLogout: async(req, res) => {
    logheader = false;
    req.session.userLoggedIn = false,
     banners= await bannerHelper.viewBanner()
     let products=await productHelper.getProduct()
      //Featured
      let Featured= await productHelper.getFeatured()
      //get popular
      let Popular=await productHelper.getPopular()
      loginStatus = false;
    res.render('user/index', { logheader, loginStatus,banners,Popular,Featured,products });
  },
  //address adding in checkout page
  CheckoutAddress:async(req,res)=>{
    let userId=req.session.users._id
    let cartCount= await userHelpers.getCartCount(userId)
    res.render('user/checkOutAddress',{ logheader: true, userSession, cartCount,wishcount })
  },
  //post postCheckoutAddress
  postCheckoutAddress:async(req,res)=>{
    let userId=req.session.users._id
     let response=await userHelpers.addAddress(userId, req.body)
    res.json(response)
  }


}



