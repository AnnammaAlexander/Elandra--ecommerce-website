var express = require('express');
var router = express.Router();
const controllers=require('../controllers/usercontroller')
const couponController=require('../controllers/couponController')
const middleware= require('../middlewares/middleware');
const usercontroller = require('../controllers/usercontroller');
/* GET home page. */
router.get('/', controllers.getHome );

//get login page
router.get('/login', controllers.getUserLogin)
//post login page
router.post('/login',controllers.postUserLogin)
//get signup page
router.get('/signup',controllers.getSignUP)
//post signup page
router.post('/signup',controllers.postSignup)


router.get('/otp',controllers.getOtp)
router.post('/otp',controllers.postOtp) 



router.get('/otp_verify',controllers.getVerify)
router.post('/otp_verify',controllers.postVerify)
// view forgot password-submit emailid
router.get('/forgot-password',controllers.getforgotPassword)
//post forgot password-verify email id
router.post('/forgot-password',controllers.postforgotpassword)
//change the password if the email is correct
router.put('/password-change',controllers.changePassword)
//reset password in userAccount
router.post('/reset-password',controllers.resetPasswordUser)


//view products
router.get("/shop",controllers.getShop)
//view product based on category,ajax call
router.get('/shop-category',controllers.categoruProducts)
router.get('/product-detail/:id',controllers.product_detail)
//search
router.post('/search',controllers.searchItems)
//product sort by price
router.get('/sortByPrice',controllers.sortProducts)

// router.get('/shop_product/:id',middleware.userSession,controllers.getShopProduct)


// router.get('/show-user-cart',controllers. getViewCart)
//add to cart from ajax
router.get('/add-to-cart/:id',middleware.userSession, middleware.blockedStatus,controllers.addToCart)
//update cart -ajax
router.post('/update-cart',middleware.userSession,controllers.AjaxUdateCart)
//delete product from cart
router.get('/delete-product-cart/:id',middleware.userSession,middleware.blockedStatus,controllers.ajaxDeleteProduct)
//view checkout page or get
router.get('/show-user-cartDispaly',middleware.userSession,middleware.blockedStatus,controllers.dummygetViewCart)
//view place orderpage
router.get('/shop-checkout',middleware.userSession,middleware.blockedStatus,controllers.getCheckout)
//check wallet amount
router.get('/walletAmt-check',middleware.userSession,middleware.blockedStatus,controllers.checkWalletAmount)

//view order success page
router.get('/order-details',middleware.blockedStatus,middleware.userSession,controllers.getOrderSuccess)

//order
router.get('/viewOrders',middleware.userSession,middleware.blockedStatus,controllers.getViewOrders)
//view order product from orderList
router.get('/view-order-products/:id',middleware.userSession,middleware.blockedStatus,controllers.viewOrederProduct)
//return orderd product
router.post('/return-product',middleware.userSession ,middleware.blockedStatus ,controllers.returnProduct)
//cancel ordered product
router.put('/cancel-product', middleware.userSession,middleware.blockedStatus ,controllers.cancelOrder)
// //view order details page
// router.get('/view-orderDetail',controllers.orderDetails)
// view whishlist page 
router.get('/shop-wishlist', middleware.userSession,middleware.blockedStatus,controllers.getWishLish)
//add wishlist
router.post('/addto-wishlist',middleware.userSession,controllers.addWishList)
//delete wishList
router.get('/delete-wishlist/:id',middleware.userSession,middleware.blockedStatus,controllers.deleteWishlist)
//add to cart from wishlist
router.get('/addCartWishlist',middleware.userSession,middleware.blockedStatus,controllers.addToCartFromWishlist)

//userProfile
router.get('/user-account',middleware.userSession,middleware.blockedStatus,controllers.getUserAccount)
//add address 
router.post('/addAddress',middleware.userSession,controllers.postAddress)
//edit address
router.get('/editAddress/:id',middleware.userSession,middleware.blockedStatus,controllers.getEditAddress)

//coupon
router.get('/available-coupon',middleware.userSession,middleware.blockedStatus,couponController.getCoupon)
//coupon apply
router.post('/apply-coupon',middleware.userSession, couponController.couponApply)

//place order
router.post('/shop-checkout',middleware.userSession, middleware.blockedStatus, controllers.postCheckout)
//razorpay verification
router.post('/verify-payment',controllers.verifyPayment)
//add address in checkout page
router.get('/checkoutAddress',middleware.userSession,controllers.CheckoutAddress,middleware.blockedStatus)
router.post('/add-checkoutAddress',middleware.userSession,controllers.postCheckoutAddress,middleware.blockedStatus)

//logout page
router.get("/logout",controllers.getLogout)
module.exports = router;
