const { response } = require('../app');
const helpers = require('../helpers/userHelpers')
const otpLogin = require("../OTP/otpLogin");
const user = require("../models/connection");
const userHelpers = require('../helpers/userHelpers');
const cartHelper = require('../helpers/cartHelper');
const wishListHelper=require('../helpers/wishListHelper')
const bannerHelper=require('../helpers/bannerHelper')
const { rmSync } = require('fs');
const { resolve } = require('path');
const session = require('express-session');
const db=require('../models/connection')
const client = require("twilio")(otpLogin.AccountSId, otpLogin.authtoken);

var userSession, loginStatus;

let number, OtpNumber
module.exports = {

//view home page
  getHome: async (req, res) => {
    let cartCount = 0

    if (req.session.userLoggedIn) {
      logheader = true
      cartCount = await userHelpers.getCartCount(req.session.users._id)
      req.session.cartCount = parseInt(cartCount)
      let banners= await bannerHelper.viewBanner()
      res.render('user/index', { userSession, logheader, cartCount ,banners})
    } else {
      logheader = false
      //console.log(logheader);
      let banners= await bannerHelper.viewBanner()
      res.render('user/index', { logheader, loginStatus,banners,cartCount });
      // res.render("user/index", { userSession, logheader, cartCount,banners })

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
    console.log("get signup..................");
    emailStatus = true
    res.render("user/signup", { emailStatus, logheader: false });
  },
//post signup page
  postSignup: (req, res) => {
    helpers.doSignUp(req.body).then((response) => {
      // console.log(response)
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
resetPassword:(req,res)=>{
  id=req.query
},
//search
searchItems:async(req,res)=>{
console.log("req.body..............",req.body.key);
let key=req.body.key
 let response=await userHelpers.searchItem(key)
 
 res.json(response)

},
//get shop page
  getShop: async (req, res) => {
    //pagination 
    const page=req.query.page||1;
    const perpage=10;
    const count=await db.product.countDocuments({})
    const orderListCount=count
    userHelpers.listProductShop(page,perpage).then(async (response)=>{
    let cartCount = 0
    if (req.session.userLoggedIn) {
      logheader = true
        cartCount = await userHelpers.getCartCount(req.session.users._id)
      req.session.cartCount = parseInt(cartCount)
      userHelpers.getShopHelperCategory().then((response) => {
        procategory = response
       //get all products from  
        userHelpers.getShopHelper().then((response) => {
        logheader = true;
          res.render('user/shop', { logheader, userSession, response, procategory, cartCount ,pages:Math.ceil(orderListCount/perpage)})
        })
      })



    } else {
      logheader = false
      //console.log(logheader);

      res.render('user/index', { userSession, logheader, cartCount,pages:Math.ceil(orderListCount/perPage) })

    }
  })
    
  },
 //view products based on category
 categoruProducts:async(req,res)=>{
  let data=req.query.data
await userHelpers.getcategoryProduct(data).then((result)=>{
  console.log("response");
  res.json(result)
})

 } ,

  product_detail: async (req, res) => {

    let cartCount = 0
    if (req.session.userLoggedIn) {
      logheader = true
      cartCount = await userHelpers.getCartCount(req.session.users._id)
      req.session.cartCount = parseInt(cartCount)
      let id = req.params.id

      console.log('id of a particular product', id);
      let response = await userHelpers.showProductDetail(id)
      logheader = true
      console.log("response.........:",response);
      res.render('user/shopProduct', { logheader, userSession, response, cartCount })
    } else {
      logheader = false
      //console.log(logheader);

      res.render('user/index', { userSession, logheader, cartCount })
    }
  },



  //view cart page
  dummygetViewCart: async (req, res) => {
let cartCount=0

    if (req.session.userLoggedIn) {
      logheader = true
      const userId = req.session.users._id
      //cart count checking 
      cartCount = await userHelpers.getCartCount(userId)
      req.session.cartCount = parseInt(cartCount)
      //aggregate cartitems  from cart & product collection
      let cartItems = await cartHelper.viewCart(userId)
      if(cartItems.length!==0){
      let total = await cartHelper.grandTotal(userId)
      grandtotal = total[0].total;
      }else{
       grandtotal=0
      }
    
      res.render("user/cartDummy", { cartItems, userId, grandtotal ,logheader,userSession, cartCount})
    } else {
      logheader = false
      res.render('user/index', { userSession, logheader })
    }


  },







//add product to cart
  // addToCart: async (req, res) => {
  //   swal("Your product is added to cart!")
  //   let productId = req.params.id
  //   let userId = req.session.users._id

  //   let product = await userHelpers.showProductDetail(productId)
    
    
    

  //   await cartHelper.addToCartHelper(userId, productId, product.Price).then((data) => {
    
  //     res.redirect('/shop')
  //   });


  // },
//   addToCart: async (req, res) => {
//     try {
//       let productId = req.params.id;
//       let userId = req.session.users._id;
//       //find quantity of product from cart
//      let data= await userHelpers.getcartQty(userId,productId)
//     const qty= data.cartItems[0].Quantity
      
//       //get product details
//       let product = await userHelpers.showProductDetail(productId);
//       let stock=product.Quantity
//       let availableStock=stock-qty
// if(availableStock>0){
//   // products add to cart
//   await cartHelper.addToCartHelper(userId, productId, product.Price).then((response)=>{
//   })
 
//    res.json(true)
// }else{
//   res.json({outOfStock:true})
// }
    
//       // res.redirect('/shop');
//     } catch (error) {
//       console.log(error);
//     }
//   },
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
    console.log("qty.........................:",qty);
    //get product details
    let product = await userHelpers.showProductDetail(productId);
    let stock = product.Quantity;
    console.log("ssssssssstttok",stock);
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
    // if the product qty 0,then delete the product from cart 
     if (updateqty === 0) {
      await cartHelper.deleteProInCart(productId, userId)
      res.json(response)
     } else {
      await cartHelper.postUpdateCart(productId, userId, subTotal, updateqty, count)
      total = await cartHelper.grandTotal(userId)
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

//view/get  checkout page
  getCheckout: async (req, res) => {
    let cartCount = 0
    if (req.session.userLoggedIn) {
      logheader = true
      let userId = req.session.users._id
      let cartItems = await cartHelper.viewCart(userId)
      total = await cartHelper.grandTotal(userId)
      grandtotal = total[0].total;
      console.log("userid........", userId);
      userAddress = await userHelpers.getAddress(userId)

      res.render('user/checkout', { userSession, logheader, cartCount, cartItems, grandtotal, userAddress })
    } else {
      logheader = false
      res.render('user/index', { userSession, logheader })
    }
  },

  //place order
  postCheckout: async (req, res) => {
    console.log(".......................",req.body);
    let userId = req.session.users._id
    let name = req.session.users.username
    let discount=parseInt(req.body.discountHidden)
    let grandTotalFromAjax=parseInt(req.body.totalhidden)

    let address = await userHelpers.findAddress(req.body.addressId, userId)
  
    let cart = await cartHelper.viewCart(userId)
    let total = await cartHelper.grandTotal(userId)
    let grandtotal = total[0].total;
    let payment = req.body.payment_option
    let response={}
    

    const paymentStatus =payment==='COD'?'placed':'pending' 
    let finalAmount
    if(req.body.coupon==''){
      finalAmount=parseInt(grandtotal)
    }else{
      finalAmount=grandTotalFromAjax
    }
    let orderId = await userHelpers.addOrder(address.Address, cart, finalAmount, name, payment, userId, paymentStatus)
    console.log("order id",orderId);
    console.log("payment/:",payment);
    
    if (payment === 'COD') {
      userHelpers.emptyCart(userId)
      response.COD=true
      response.OrderID=orderId
      console.log("responseeeeeee.......................",response);
      res.json(response)
    }else if(payment==='Razorpay'){
      userHelpers.getRazorpay(orderId,finalAmount).then((response)=>{
        response.Razorpay=true
        console.log("responseeeeeee.......................",response);
        
           res.json(response)
    })
    } else {
      response.wallet=true
        response.OrderID=orderId
        res.json(response)
    }
    
  


  },
  // //view user account page
  // getUserAccount: async(req, res) => {
  //   let cartCount = 0
  //   if (req.session.userLoggedIn) {
  //     logheader = true
  //     let userId = req.session.users._id
  //     //find username
  //    let username=await userHelpers.useraccountFindName(userId)
  //    //pagination to the order list
  //   const page=req.query.page||1;
  //   const perpage=10;
  //   const count=await db.order.countDocuments({})
  //   const orderListCount=count
  //    //get all orderlist
  //   let orderedList = await userHelpers.findOrders(userId,page,perpage)
     
  //     res.render('user/myAccount', { userSession, logheader, cartCount,username,orderedList,pages:Math.ceil(orderListCount/perpage) })
  //   } else {
  //     logheader = false
  //     res.render('user/login', { userSession, logheader })
  //   }
  // },

  //view user account page
getUserAccount: async (req, res) => {
  let cartCount = 0;
  let logheader = false;
  let userSession = req.session.userLoggedIn;
  let userId = req.session.users._id;

  if (userSession) {
    logheader = true;
    //find username
    let username = await userHelpers.useraccountFindName(userId);

    

    let orderedList = await userHelpers.findOrders(userId,);
    let address = await userHelpers.GetAlldAddress( userId)
    console.log("lllllllllllllllllllllll:",address);
   
    res.render("user/myAccount", {
      userSession,
      logheader,
      cartCount,
      username,
      orderedList,
     address,
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
  orderDetails:(req,res)=>{
    res.render('user/viewOrderProduct', { logheader:true, userSession, cartCount ,orderDetails})
  },
  //view orderlist page
  getViewOrders: async(req, res) => {
    let userId = req.session.users._id
    let orderedList = await userHelpers.findOrders(userId)
    let cartCount = 0
    console.log("orderedList:", orderedList);
    res.render('user/viewOrders', { cartCount,logheader: true, userSession, orderedList })
  },
  viewOrederProduct:async (req, res) => {
    if (req.session.userLoggedIn) {
      logheader = true
    let id = req.params.id
    let userid=req.session.users._id
  
    let orderDetails= await userHelpers.orderDetails(id,userid)
    let cartCount = 0
    console.log("orderdetails....",orderDetails);
    res.render('user/viewOrderProduct', { logheader:true, userSession, cartCount ,orderDetails})
    }else{
      logheader=false
      res.render('user/index', { userSession, logheader })
    }
  },
  //return oredred product
  returnProduct:async(req,res)=>{
   
    await db.order.updateOne({_id:req.body.orderid},{$set:{orderStatus:'Returned'}})
    res.json(true)
  },
//cancel order
cancelOrder:async(req,res)=>{
  console.log("jjjjjjjjjjjjjjjjjjjjjjjjj:",req.body.orderid);
  await db.order.updateOne({_id:req.body.orderid},{$set:{orderStatus:'Canceled by User'}})
  res.json(true)
},
//get or view wishlist page
  getWishLish: async(req, res) => {
    let cartCount = 0
    let wishlistItems= await wishListHelper.wishlist(req.session.users._id)
    console.log("....",wishlistItems);
  
    res.render('user/shopWishlist', { logheader: true, userSession, cartCount,wishlistItems })
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
  console.log("......................",userId);
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
      res.json(true)
    })
  },
  //logout 
  getLogout: async(req, res) => {
    logheader = false;
    req.session.userLoggedIn = false,
     banners= await bannerHelper.viewBanner()
      loginStatus = false;
    res.render('user/index', { logheader, loginStatus,banners });
  },


}



